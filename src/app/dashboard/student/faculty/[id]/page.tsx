'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getFacultyById } from '@/lib/mock-data';

export default function FacultyProfilePage() {
  const { id } = useParams();
  const faculty = getFacultyById(id as string);

  if (!faculty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The faculty profile you're looking for doesn't exist.
          </p>
          <Link href="/dashboard/student/faculty">
            <Button className="mt-4">Back to All Faculty</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard/student/faculty">
          <Button variant="outline" size="sm">
            ← Back to All Faculty
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              {/* Profile Image & Basic Info */}
              <div className="flex flex-col items-center lg:items-start mb-6 lg:mb-0">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-4xl">
                    {faculty.name.charAt(0)}
                  </span>
                </div>
                <div className={`flex items-center space-x-2 ${faculty.availability ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-3 h-3 rounded-full ${faculty.availability ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm font-medium">
                    {faculty.availability ? 'Available for collaboration' : 'Currently unavailable'}
                  </span>
                </div>
              </div>

              {/* Main Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {faculty.name}
                </h1>
                <p className="text-xl text-blue-600 dark:text-blue-400 mb-2">
                  {faculty.designation}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                  {faculty.department}
                </p>
                
                {faculty.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {faculty.bio}
                  </p>
                )}

                {/* Contact Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button size="lg">
                    Send Message
                  </Button>
                  <Button variant="outline" size="lg">
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="lg">
                    Get Directions
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:w-48">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {faculty.experience}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Years Experience</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {faculty.currentProjects.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open Projects</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Research Areas */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Research Areas
              </h2>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {faculty.researchAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Projects */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Research Projects
              </h2>
            </CardHeader>
            <CardContent>
              {faculty.currentProjects.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No current projects available.
                </p>
              ) : (
                <div className="space-y-6">
                  {faculty.currentProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'open' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {project.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Tech Stack:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Requirements:
                        </h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                          {project.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: {project.duration}
                        </span>
                        <Link href={`/dashboard/student/projects/${project.id}`}>
                          <Button size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publications */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Publications
              </h2>
            </CardHeader>
            <CardContent>
              {faculty.publications.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No publications listed.
                </p>
              ) : (
                <div className="space-y-4">
                  {faculty.publications.map((pub) => (
                    <div key={pub.id} className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {pub.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pub.authors.join(', ')} • {pub.journal} • {pub.year}
                      </p>
                      {pub.abstract && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {pub.abstract}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">{faculty.email}</p>
              </div>
              {faculty.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Phone</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{faculty.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cabin Location */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cabin Location
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Building:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">{faculty.cabinLocation.building}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Floor:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">{faculty.cabinLocation.floor}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Room:</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">{faculty.cabinLocation.room}</span>
                </p>
                {faculty.cabinLocation.block && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">Department:</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{faculty.cabinLocation.block}</span>
                  </p>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Get Directions
              </Button>
            </CardContent>
          </Card>

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Qualifications
              </h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {faculty.qualification.map((qual, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-gray-700 dark:text-gray-300">{qual}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}