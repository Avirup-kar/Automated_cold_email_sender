import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';

import type { EmailSendJobData } from '../scheduler.types';
import { EmailSendProcessor } from './email-send.processor';

describe('EmailSendProcessor', () => {
  it('only logs that an email job is ready', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const processor = new EmailSendProcessor();

    await processor.process({
      name: 'send-email',
      data: {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        userId: 'user-1',
        email: 'one@example.com',
        subject: 'Subject',
        message: 'Message',
      },
    } as Job<EmailSendJobData>);

    expect(log).toHaveBeenCalledWith(
      'Email job ready for: one@example.com (campaignId=campaign-1, recipientId=recipient-1)',
    );
    log.mockRestore();
  });
});
