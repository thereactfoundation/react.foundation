// Admin table for reviewing pending community submissions
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SemanticBadge, SemanticButton } from '@/components/rfds/semantic-components';
import type { CommunitySubmission } from '@/types/community-submission';

interface PendingSubmissionsTableProps {
  submissions: CommunitySubmission[];
}

export function PendingSubmissionsTable({ submissions }: PendingSubmissionsTableProps) {
  const router = useRouter();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectFormId, setRejectFormId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<{ id: string; message: string } | null>(null);

  const isBusy = (id: string) => approvingId === id || rejectingId === id;

  async function handleApprove(id: string) {
    setApprovingId(id);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/community-submissions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to approve (${res.status})`);
      }
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setErrorMsg({ id, message });
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(id: string) {
    setRejectingId(id);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/community-submissions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason: rejectReason }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to reject (${res.status})`);
      }
      setRejectFormId(null);
      setRejectReason('');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Action failed';
      setErrorMsg({ id, message });
    } finally {
      setRejectingId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No pending submissions.</p>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <div
          key={s.id}
          className="border border-border rounded-lg p-4 bg-muted/30 space-y-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">{s.name}</h4>
              <p className="text-sm text-muted-foreground">
                {s.city}, {s.country}
              </p>
            </div>
            <SemanticBadge variant={
              s.verification_status === 'pending' ? 'warning' :
              s.verification_status === 'rejected' ? 'destructive' : 'success'
            }>
              {s.verification_status}
            </SemanticBadge>
          </div>

          <p className="text-sm text-foreground">{s.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>Organizer: {s.organizer_name} ({s.organizer_email})</div>
            <div>Submitted by: {s.submitted_by}</div>
            {s.website && <div>Website: {s.website}</div>}
            {s.meetup_url && <div>Meetup: {s.meetup_url}</div>}
            {s.member_count ? <div>Members: {s.member_count}</div> : null}
            <div>Submitted: {new Date(s.submitted_at).toLocaleDateString()}</div>
          </div>

          {errorMsg?.id === s.id && (
            <p className="text-sm text-destructive">{errorMsg.message}</p>
          )}

          {s.verification_status === 'pending' && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {rejectFormId === s.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground"
                  />
                  <SemanticButton
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(s.id)}
                    disabled={isBusy(s.id)}
                  >
                    {rejectingId === s.id ? 'Rejecting...' : 'Confirm'}
                  </SemanticButton>
                  <SemanticButton
                    variant="secondary"
                    size="sm"
                    onClick={() => { setRejectFormId(null); setRejectReason(''); }}
                    disabled={rejectingId === s.id}
                  >
                    Cancel
                  </SemanticButton>
                </div>
              ) : (
                <>
                  <SemanticButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleApprove(s.id)}
                    disabled={isBusy(s.id)}
                  >
                    {approvingId === s.id ? 'Approving...' : 'Approve'}
                  </SemanticButton>
                  <SemanticButton
                    variant="destructive"
                    size="sm"
                    onClick={() => { setRejectFormId(s.id); setRejectReason(''); setErrorMsg(null); }}
                    disabled={isBusy(s.id)}
                  >
                    Reject
                  </SemanticButton>
                </>
              )}
            </div>
          )}

          {s.verification_status === 'rejected' && s.rejection_reason && (
            <p className="text-sm text-destructive pt-2 border-t border-border">
              Rejected: {s.rejection_reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
