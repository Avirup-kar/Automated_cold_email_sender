export const CAMPAIGN_EVENTS_CLIENT = Symbol('CAMPAIGN_EVENTS_CLIENT');
export const CAMPAIGN_SCHEDULED_TOPIC = 'campaign.scheduled';

export function getKafkaBrokers(): string[] {
  return (process.env.KAFKA_BROKERS ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}
