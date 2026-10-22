import { bench, describe } from 'vitest';
import { limitAsync as limitAsyncToolkit, Semaphore as SemaphoreToolkit } from 'es-toolkit';

async function drainSemaphore(waiterCount: number) {
  const semaphore = new SemaphoreToolkit(1);

  await semaphore.acquire();

  const waiters: Array<Promise<void>> = [];

  for (let i = 0; i < waiterCount; i++) {
    waiters.push(semaphore.acquire());
  }

  for (let i = 0; i < waiterCount; i++) {
    semaphore.release();
  }

  await Promise.all(waiters);
}

describe('Semaphore with 10 waiting tasks', () => {
  bench('es-toolkit/Semaphore', async () => {
    await drainSemaphore(10);
  });
});

describe('Semaphore with 30,000 waiting tasks', () => {
  bench('es-toolkit/Semaphore', async () => {
    await drainSemaphore(30_000);
  });
});

describe('limitAsync with 30,000 calls and a concurrency of 10', () => {
  const ids = Array.from({ length: 30_000 }, (_, i) => i);
  const fetchUser = limitAsyncToolkit(async (id: number) => id, 10);

  bench('es-toolkit/limitAsync', async () => {
    await Promise.all(ids.map(id => fetchUser(id)));
  });
});
