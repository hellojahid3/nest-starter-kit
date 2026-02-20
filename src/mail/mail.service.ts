import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { existsSync } from "fs";
import { promises as fsPromises } from "fs";
import * as handlebars from "handlebars";
import * as nodemailer from "nodemailer";
import * as path from "path";

import { appConfig } from "@/app.config";
import { SendEmailDto } from "./dto/email.dto";
import { mailConfig } from "./mail.config";

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly templatesDir = MailService.resolveTemplatesDir();
  private readonly defaultTemplate = "default";

  private readonly templateCache = new Map<
    string,
    handlebars.TemplateDelegate
  >();

  private transporter: nodemailer.Transporter;
  private isInitialized = false;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @Inject(mailConfig.KEY)
    private readonly mailConfiguration: ConfigType<typeof mailConfig>
  ) {}

  /**
   * Initialize the mail service when the module starts
   */
  async onModuleInit(): Promise<void> {
    await this.initializeTransporter();
  }

  /**
   * Initializes the email transporter with the configuration
   * @throws Error if initialization fails
   */
  private async initializeTransporter(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.mailConfiguration.host,
        port: this.mailConfiguration.port,
        secure: this.mailConfiguration.encryption === "ssl",
        auth: {
          user: this.mailConfiguration.username,
          pass: this.mailConfiguration.password,
        },
        pool: true,
        maxConnections: this.mailConfiguration.maxConnections || 5,
        maxMessages: this.mailConfiguration.maxMessages || 100,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === "production",
        },
        debug: false,
        logger: false,
      });

      await this.verifyTransporter();
      this.isInitialized = true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to initialize email transport: ${error.message}`,
          error.stack
        );
      }
      throw error;
    }
  }

  /**
   * Verifies the transporter connection
   */
  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log("Email transport initialized successfully");
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Transport verification failed: ${error.message}`,
          error.stack
        );
      }
      throw error;
    }
  }

  /**
   * Resolves the templates directory so it works in both dev and production.
   */
  private static resolveTemplatesDir(): string {
    const nextToCompiled = path.join(__dirname, "templates");
    if (existsSync(nextToCompiled)) {
      return nextToCompiled;
    }

    const nestAssetsPath = path.join(
      __dirname,
      "..",
      "..",
      "mail",
      "templates"
    );

    if (existsSync(nestAssetsPath)) {
      return nestAssetsPath;
    }

    return nextToCompiled;
  }

  /**
   * Loads and compiles a Handlebars template, with caching
   * @param templateName Name of the template file (without extension)
   * @returns Compiled template function
   */
  private async loadTemplate(
    templateName: string
  ): Promise<handlebars.TemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      const cachedTemplate = this.templateCache.get(templateName);
      if (cachedTemplate) {
        return cachedTemplate;
      }
    }

    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const source = await fsPromises.readFile(templatePath, "utf8");
      const template = handlebars.compile(source, {
        strict: true,
        preventIndent: true,
      });

      // Cache the compiled template
      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to load template ${templateName}: ${error.message}`,
          error.stack
        );
      }
      throw new Error(`Failed to load template: ${templateName}`);
    }
  }

  /**
   * Compiles a Handlebars template with provided data
   * @param templateName Name of the template file (without extension)
   * @param data Data to be injected into the template
   * @returns Compiled HTML string
   */
  private async compileTemplate(
    templateName: string,
    data: Record<string, unknown>
  ): Promise<string> {
    try {
      const template = await this.loadTemplate(templateName);

      return template(data);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to compile template ${templateName}: ${error.message}`,
          error.stack
        );
      }
      throw new Error(`Failed to compile template: ${templateName}`);
    }
  }

  /**
   * Sends an email using the configured transport
   * @param dto Email data transfer object
   * @returns Promise resolving to the sending result
   * @throws Error if email sending fails
   */
  async sendEmail(dto: SendEmailDto): Promise<nodemailer.SentMessageInfo> {
    if (!this.isInitialized) {
      await this.initializeTransporter();
    }

    const {
      recipients,
      subject,
      html,
      text,
      template,
      templateData,
      attachments,
      cc,
      bcc,
    } = dto;

    const options: nodemailer.SendMailOptions = {
      from: `${this.mailConfiguration.fromName} <${this.mailConfiguration.fromAddress}>`,
      to: recipients,
      subject,
      cc,
      bcc,
      attachments,
      headers: {
        "X-Priority": "1",
        "X-Mailer": `${this.appConfiguration.name}Mailer`,
      },
    };

    try {
      // Handle email content based on provided inputs
      if (template) {
        if (!templateData) {
          throw new Error("Template data is required when using a template");
        }
        options.html = await this.compileTemplate(template, templateData);
      } else if (html) {
        options.html = html;
        if (text) options.text = text;
      } else if (templateData) {
        options.html = await this.compileTemplate(
          this.defaultTemplate,
          templateData
        );
      } else if (text) {
        options.text = text;
      } else {
        throw new Error("Email content (html, text, or template) is required");
      }

      // Generate plain text from HTML if not provided
      if (options.html && !options.text && typeof options.html === "string") {
        options.text = this.htmlToPlainText(options.html);
      }

      await this.transporter.sendMail(options);

      this.logger.log(`Email sent successfully to: ${recipients.join(", ")}`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error sending mail: ${error.message}`, {
          stack: error.stack,
          recipients,
          subject,
        });
      }
      throw new Error(`Failed to send email`);
    }
  }

  /**
   * Convert HTML to plain text for email clients that don't support HTML
   * @param html HTML content
   * @returns Plain text representation
   */
  private htmlToPlainText(html: string): string {
    // Basic HTML to text conversion - in production you might want to use a library like html-to-text
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style[^>]*>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script[^>]*>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  /**
   * Pre-compile all templates in the templates directory
   * Useful for performance in production
   */
  async precompileTemplates(): Promise<void> {
    try {
      const files = await fsPromises.readdir(this.templatesDir);
      const hbsFiles = files.filter(file => file.endsWith(".hbs"));

      for (const file of hbsFiles) {
        const templateName = path.basename(file, ".hbs");
        await this.loadTemplate(templateName);
      }

      this.logger.log(`Pre-compiled ${hbsFiles.length} email templates`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to pre-compile templates: ${error.message}`,
          error.stack
        );
      }
    }
  }

  /**
   * Gracefully close the transporter connections when application shuts down
   */
  onModuleDestroy() {
    if (this.transporter) {
      this.logger.log("Closing email transport connections");
      this.transporter.close();
      this.isInitialized = false;
    }
  }
}
