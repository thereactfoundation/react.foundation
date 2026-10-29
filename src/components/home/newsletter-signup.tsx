'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NEWSLETTER_CONSENT_TEXT } from '@/lib/newsletter/consent';

export function NewsletterSignup() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  // The form unmounts on success, so move focus to the confirmation instead of losing it.
  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

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
          website: data.get('newsletter_hp'),
        }),
      });
      // Hosting errors (e.g. a 502/504 page) are not JSON; never show their raw text.
      const result: unknown = await response.json().catch(() => null);
      const serverMessage = result && typeof result === 'object' && 'message' in result && typeof result.message === 'string'
        ? result.message
        : null;
      if (!response.ok) {
        setStatus('error');
        setMessage(serverMessage ?? 'We couldn’t save your subscription. Please try again.');
        return;
      }
      setStatus('success');
    } catch {
      // Network failures surface browser wording like "Failed to fetch"; show friendly copy instead.
      setStatus('error');
      setMessage('We couldn’t save your subscription. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div
        ref={successRef} tabIndex={-1} role="status"
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-6 text-card-foreground outline-none"
      >
        <CheckCircle className="size-7 shrink-0 text-success" aria-hidden="true" />
        <p className="text-lg font-semibold">Subscribed! Thanks for joining.</p>
      </div>
    );
  }

  return (
    <form onSubmit={subscribe} aria-label="Newsletter signup" aria-busy={status === 'pending'}>
      <fieldset disabled={status === 'pending'} className="min-w-0 space-y-4">
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
              {status === 'pending' ? 'Subscribing…' : 'Subscribe'}
            </Button>
          </div>
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted-foreground">
          <Checkbox name="consent" required className="mt-1 shrink-0" />
          <span>{NEWSLETTER_CONSENT_TEXT}</span>
        </label>
        {/* Honeypot: a name autofill doesn't recognise, plus password-manager opt-outs, so real visitors leave it empty. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="newsletter-hp">Leave this field empty</label>
          <input
            id="newsletter-hp" name="newsletter_hp" type="text" tabIndex={-1} autoComplete="off"
            data-1p-ignore="" data-lpignore="true" data-bwignore="" data-form-type="other"
          />
        </div>
      </fieldset>
      <p className="mt-3 text-xs text-muted-foreground">
        Learn more in our{' '}
        <a href="https://lfprojects.org/policies/privacy-policy/" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </a>
      </p>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-h-6 text-sm text-destructive">
        {message}
      </p>
    </form>
  );
}
