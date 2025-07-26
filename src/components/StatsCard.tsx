import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'red' | 'green' | 'blue' | 'purple' | 'orange';
  icon?: string | LucideIcon;
}

export default function StatsCard({ title, value, subtitle, color = 'blue', icon }: StatsCardProps) {
  const colorClasses = {
    red: 'text-red-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <div className="card text-center hover:shadow-xl transition-shadow duration-300">
      {icon && (
        <div className="text-3xl mb-3">
          {typeof icon === 'string' ? (
            <span>{icon}</span>
          ) : (
            <div className="w-8 h-8 mx-auto">
              {React.createElement(icon, { className: "w-8 h-8" })}
            </div>
          )}
        </div>
      )}
      <div className={`text-4xl font-bold mb-2 ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-gray-600 font-medium">{title}</div>
      {subtitle && (
        <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
} 