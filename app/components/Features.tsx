import { ReactNode } from 'react';

type FeatureCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Two Ways to Use SwimTrackr</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're managing a swim school or tracking your child's progress, SwimTrackr has the tools you need.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* For Swim Schools/Facilities */}
          <div className="space-y-6">
            <div className="bg-primary-600 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">For Swim Schools & Facilities</h3>
              <p>
                A complete management system to organize sessions, manage instructors, and engage with parents.
              </p>
            </div>
            
            <FeatureCard
              title="Centralized Session Management"
              description="Create and manage swimming lessons, track attendance, and organize your schedule efficiently."
              icon={<span className="text-xl">📅</span>}
            />
            
            <FeatureCard
              title="Instructor Management"
              description="Assign instructors to sessions, manage their schedules, and track performance metrics."
              icon={<span className="text-xl">👨‍🏫</span>}
            />
            
            <FeatureCard
              title="Automatic Parent Communication"
              description="Parents are automatically invited when their children are enrolled in sessions, keeping them informed."
              icon={<span className="text-xl">📱</span>}
            />
          </div>
          
          {/* For Parents */}
          <div className="space-y-6">
            <div className="bg-primary-600 text-white p-6 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">For Parents</h3>
              <p>
                Track your child's swimming progress independently, record milestones, and set goals.
              </p>
            </div>
            
            <FeatureCard
              title="Independent Progress Tracking"
              description="Monitor your child's swimming skills and development without being attached to a facility."
              icon={<span className="text-xl">📊</span>}
            />
            
            <FeatureCard
              title="Skill Benchmarks"
              description="Record and track important swimming skills and milestones as your child advances."
              icon={<span className="text-xl">🏊‍♂️</span>}
            />
            
            <FeatureCard
              title="Goal Setting"
              description="Set personalized swimming goals for your child and celebrate their achievements."
              icon={<span className="text-xl">🎯</span>}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 