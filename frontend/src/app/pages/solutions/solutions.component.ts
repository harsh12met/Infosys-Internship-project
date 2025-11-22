import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-solutions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.css',
})
export class SolutionsComponent {
  solutions = [
    {
      icon: '👤',
      title: 'Personal Productivity',
      description:
        'Organize your daily tasks, track personal goals, and manage your time effectively with a visual workflow.',
      benefits: [
        'Track daily to-dos',
        'Manage personal projects',
        'Set and achieve goals',
        'Visualize progress',
      ],
    },
    {
      icon: '👥',
      title: 'Small Team Project Management',
      description:
        'Coordinate team efforts, assign tasks, and keep everyone aligned on project goals and deadlines.',
      benefits: [
        'Collaborate efficiently',
        'Assign team responsibilities',
        'Track project milestones',
        'Improve communication',
      ],
    },
    {
      icon: '🎓',
      title: 'Student Task Tracking',
      description:
        'Stay on top of assignments, projects, and study schedules. Perfect for students managing multiple courses.',
      benefits: [
        'Track assignments',
        'Manage study schedules',
        'Organize course materials',
        'Meet deadlines easily',
      ],
    },
    {
      icon: '🏢',
      title: 'Office Workflow Planning',
      description:
        'Streamline office processes, manage department tasks, and coordinate cross-functional projects.',
      benefits: [
        'Plan departmental work',
        'Coordinate teams',
        'Track deliverables',
        'Optimize workflows',
      ],
    },
    {
      icon: '📅',
      title: 'Daily Task Organization',
      description:
        'Structure your day with clear priorities, organize tasks by status, and maintain focus on what matters.',
      benefits: [
        'Prioritize daily tasks',
        'Stay organized',
        'Reduce overwhelm',
        'Boost productivity',
      ],
    },
  ];
}
