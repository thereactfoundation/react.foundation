'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NEWSLETTER_CONSENT_TEXT } from '@/lib/newsletter/consent';

export function NewsletterSignup() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'pending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus('pending');
    setMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          consent: data.get('consent') === 'on',
          website: data.get('website'),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.message === 'string' ? result.message : 'Please try again in a moment.');
      }
      setStatus('success');
      setMessage('You’re subscribed. Thanks for joining!');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'We couldn’t save your subscription. Please try again.');
    }
  }

  return (
    <form onSubmit={subscribe} aria-label="Newsletter signup" aria-busy={status === 'pending'}>
      <fieldset disabled={status === 'pending' || status === 'success'} className="min-w-0 space-y-4">
        <div>
          <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium text-foreground">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="newsletter-email" name="email" type="email" autoComplete="email"
              placeholder="you@example.com" required maxLength={254}
              className="h-11 min-w-0 flex-1 rounded-full px-4"
            />
            <Button type="submit" className="shrink-0">
              {status === 'pending' ? 'Subscribing…' : status === 'success' ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
          <Checkbox name="consent" required className="mt-1 shrink-0" />
          <span>{NEWSLETTER_CONSENT_TEXT}</span>
        </label>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="newsletter-website">Leave this field empty</label>
          <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>
      <p className="mt-3 text-xs text-muted-foreground">
        Learn more in our{' '}
        <a href="https://lfprojects.org/policies/privacy-policy/" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
      </p>
      <p role="status" aria-live="polite" aria-atomic="true" className={`mt-3 min-h-6 text-sm ${status === 'error' ? 'text-destructive' : 'text-foreground'}`}>
        {message}
      </p>
    </form>
  );
}
