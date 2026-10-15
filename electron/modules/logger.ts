import fs from 'fs';
import path from 'path';
import os from 'os';

export class AppLogger {
  private logDir: string;
  private currentLogFile: string;
  private memoryLogs: string[] = [];
  private maxMemoryLogs = 2000;

  constructor() {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    this.logDir = path.join(appData, 'Kickstart', 'logs');

    try {
      const oldLogDir = path.join(appData, 'SetupInul', 'logs');
      if (fs.existsSync(oldLogDir) && !fs.existsSync(this.logDir)) {
        fs.cpSync(oldLogDir, this.logDir, { recursive: true });
      }

      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create log dir:', err);
    }

    const today = new Date().toISOString().slice(0, 10);
    this.currentLogFile = path.join(this.logDir, `kickstart-${today}.log`);
  }

  public log(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG', message: string): string {
    const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const formatted = `[${time}] [${level}] ${message}`;

    this.memoryLogs.push(formatted);
    if (this.memoryLogs.length > this.maxMemoryLogs) {
      this.memoryLogs.shift();
    }

    try {
      fs.appendFileSync(this.currentLogFile, formatted + '\n', 'utf8');
    } catch (err) {
      console.error('Failed writing to log file:', err);
    }

    return formatted;
  }

  public info(msg: string): string {
    return this.log('INFO', msg);
  }

  public success(msg: string): string {
    return this.log('SUCCESS', msg);
  }

  public warn(msg: string): string {
    return this.log('WARN', msg);
  }

  public error(msg: string): string {
    return this.log('ERROR', msg);
  }

  public getRecentLogs(): string[] {
    return [...this.memoryLogs];
  }

  public getAllLogContent(): string {
    return this.memoryLogs.join('\n');
  }

  public getLogFilePath(): string {
    return this.currentLogFile;
  }

  public clear(): void {
    this.memoryLogs = [];
  }
}

export const logger = new AppLogger();
