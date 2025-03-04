import { Metadata } from 'next';
import SessionDetailsClient from './SessionDetailsClient';

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ id: string }>;
};

export default async function SessionDetailsPage({ params }: Props) {
  // We need to await params to get the id
  const { id } = await params;
  return <SessionDetailsClient id={id} />;
}

// Metadata also needs to be updated to handle async params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Session ${id}`,
  };
}