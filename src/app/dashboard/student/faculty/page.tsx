'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { mockFaculty, searchFaculty } from '@/lib/mock-data';

export default function AllFacultyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const departments = ['All', ...new Set(mockFaculty.map(f => f.department))];

  const filteredFaculty = useMemo(() => {
    let faculty = mockFaculty;
    
    if (searchQuery) {
      faculty = searchFaculty(searchQuery, selectedDepartment === 'All' ? undefined : selectedDepartment);
    } else if (selectedDepartment && selectedDepartment !== 'All') {
      faculty = faculty.filter(f => f.department === selectedDepartment);
    }
    
    return faculty;
  }, [searchQuery, selectedDepartment]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          All Faculty
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover faculty members across all departments and their research areas.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search faculty by name or research area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="lg:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((faculty) => (
          <Card key={faculty.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Faculty Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {faculty.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {faculty.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faculty.designation}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {faculty.department}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`w-3 h-3 rounded-full ${faculty.availability ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {faculty.availability ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              {/* Research Areas */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Research Areas
                </h4>
                <div className="flex flex-wrap gap-1">
                  {faculty.researchAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {area}
                    </span>
                  ))}
                  {faculty.researchAreas.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      +{faculty.researchAreas.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faculty.experience}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Years Exp.</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {faculty.currentProjects.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open Projects</p>
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Cabin Location
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {faculty.cabinLocation.building}, Floor {faculty.cabinLocation.floor}, Room {faculty.cabinLocation.room}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href={`/dashboard/student/faculty/${faculty.id}`}>
                  <Button className="w-full" size="sm">
                    View Profile
                  </Button>
                </Link>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Get Directions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No faculty found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or browse all departments.
          </p>
        </div>
      )}
    </div>
  );
}