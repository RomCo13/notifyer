import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotifierService {
  private repo = process.env.GIT_REPO;
  private token = process.env.PUSHOVER_TOKEN;
  private user = process.env.PUSHOVER_USER;

  async pushAlert(filePath: string, message: string) {
    const repoDir = path.join(__dirname, '../../repo');
    if (!fs.existsSync(repoDir)) {
      execSync(`git clone ${this.repo} ${repoDir}`);
    } else {
      execSync('git pull', { cwd: repoDir });
    }
    const alertsDir = path.join(repoDir, 'alerts');
    if (!fs.existsSync(alertsDir)) {
      fs.mkdirSync(alertsDir);
    }
    execSync(`cp ${filePath} ${alertsDir}/`);
    execSync('git add .', { cwd: repoDir });
    execSync(`git commit -m "Add alert ${path.basename(filePath)}"`, { cwd: repoDir });
    execSync('git push origin HEAD:stock-alerts-bot', { cwd: repoDir });

    await axios.post('https://api.pushover.net/1/messages.json', {
      token: this.token,
      user: this.user,
      message,
    });
  }
}
