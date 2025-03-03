'use client';

import { UserRole } from '@/lib/database.types';

interface RoleBadgeProps {
  role: UserRole | string;
}

export default function UserRoleBadge({ role }: RoleBadgeProps) {
  const getColorForRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'facility_parent':
        return 'bg-orange-100 text-orange-800';
      case 'parent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'instructor':
        return 'Instructor';
      case 'facility_parent':
        return 'Facility Parent';
      case 'parent':
        return 'Parent';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getColorForRole(role)}`}>
      {getRoleLabel(role)}
    </span>
  );
} 