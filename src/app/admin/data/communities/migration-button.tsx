'use client';

import { useState } from 'react';
import { SemanticButton } from '@/components/rfds/semantic-components';
export function MigrationButton() {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-communities', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setResult(`✅ Migration complete! ${data.message}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult(`❌ Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setResult(`❌ Error: ${message}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-2">
      <SemanticButton
        variant="warning"
        onClick={handleMigrate}
        disabled={migrating}
      >
        {migrating ? 'Migrating...' : 'Trigger Migration Now'}
      </SemanticButton>
      {result && (
        <p className={`text-sm ${result.includes('✅') ? 'text-success-foreground' : 'text-destructive'}`}>
          {result}
        </p>
      )}
    </div>
  );
}

