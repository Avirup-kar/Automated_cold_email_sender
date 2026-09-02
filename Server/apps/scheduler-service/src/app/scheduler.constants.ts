export const CAMPAIGN_SCHEDULED_TOPIC = 'campaign.scheduled';

export const CAMPAIGN_SCHEDULER_QUEUE = 'campaign-scheduler';
export const PROCESS_CAMPAIGN_JOB = 'process-campaign';

export const EMAIL_SEND_QUEUE = 'email-send';
export const SEND_EMAIL_JOB = 'send-email';

export function getKafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}
