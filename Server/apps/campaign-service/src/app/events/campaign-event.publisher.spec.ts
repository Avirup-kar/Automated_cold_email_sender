import type { ClientKafka } from '@nestjs/microservices';
import { of } from 'rxjs';

import { CampaignEventPublisher } from './campaign-event.publisher';
import { CAMPAIGN_SCHEDULED_TOPIC } from './campaign-events.constants';

describe('CampaignEventPublisher', () => {
  it('publishes only campaign scheduling metadata', async () => {
    const emit = jest.fn().mockReturnValue(of(undefined));
    const kafkaClient = { emit } as unknown as ClientKafka;
    const publisher = new CampaignEventPublisher(kafkaClient);
    const event = {
      campaignId: 'campaign-1',
      userId: 'user-1',
      scheduledAt: '2026-09-03T10:30:00.000Z',
    };

    await publisher.publishCampaignScheduled(event);

    expect(emit).toHaveBeenCalledWith(CAMPAIGN_SCHEDULED_TOPIC, event);
  });
});
