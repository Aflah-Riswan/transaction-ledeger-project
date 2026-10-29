import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase } from '../src/infrastructure/database/connectDB';

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});