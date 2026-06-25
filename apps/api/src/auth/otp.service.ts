import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

/**
 * Minimal time-window OTP generator/verifier.
 * Stands in for a real provider (Twilio Verify, authenticator TOTP, etc.) —
 * swap the implementation here without touching AuthService.
 */
@Injectable()
export class OtpService {
  private readonly windowSeconds = 300;

  generate(secret: string, time = Date.now()): string {
    const counter = Math.floor(time / 1000 / this.windowSeconds);
    const hmac = createHmac('sha256', secret).update(String(counter)).digest('hex');
    const code = parseInt(hmac.slice(0, 8), 16) % 1_000_000;
    return code.toString().padStart(6, '0');
  }

  verify(secret: string, code: string, time = Date.now()): boolean {
    return this.generate(secret, time) === code;
  }
}
