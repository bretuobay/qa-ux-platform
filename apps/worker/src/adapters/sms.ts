export interface SmsAdapter {
  send(to: string, message: string): Promise<void>
}

export class ConsoleSmsAdapter implements SmsAdapter {
  async send(to: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${to} | Message: ${message}`)
  }
}

export class HubtelSmsAdapter implements SmsAdapter {
  constructor(private readonly apiKey: string) {}

  async send(to: string, message: string): Promise<void> {
    const response = await fetch('https://smsc.hubtel.com/v1/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ To: to, Content: message }),
    })

    if (!response.ok) {
      throw new Error(`Hubtel SMS failed: ${response.status} ${response.statusText}`)
    }
  }
}

export function createSmsAdapter(env: { HUBTEL_API_KEY?: string }): SmsAdapter {
  if (env.HUBTEL_API_KEY) {
    return new HubtelSmsAdapter(env.HUBTEL_API_KEY)
  }
  return new ConsoleSmsAdapter()
}
