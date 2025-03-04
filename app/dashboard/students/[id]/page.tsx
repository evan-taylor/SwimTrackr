import { Metadata } from 'next';
import StudentDetailsClient from './StudentDetailsClient';

// Server component to handle the async params
type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailsPage({ params }: Props) {
  const { id } = await params;
  return <StudentDetailsClient id={id} />;
}

// Metadata function to generate page title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Student ${id}`,
  };
} 