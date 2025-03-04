import { Metadata } from 'next';
import EditStudentClient from './EditStudentClient';

// Server component to handle the async params
type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params;
  return <EditStudentClient id={id} />;
}

// Metadata function to generate page title
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Student ${id}`,
  };
} 