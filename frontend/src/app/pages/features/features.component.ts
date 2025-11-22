import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {
  features = [
    {
      icon: '📋',
      title: 'Kanban Boards',
      description:
        'Visualize your workflow with intuitive Kanban boards that help you organize tasks and track progress at a glance.',
    },
    {
      icon: '🎯',
      title: 'Drag-and-Drop Tasks',
      description:
        'Effortlessly move tasks between columns with smooth drag-and-drop functionality. Update task status instantly.',
    },
    {
      icon: '⭐',
      title: 'Task Priorities',
      description:
        'Set priorities (Low, Medium, High) for each task to focus on what matters most and manage your workload effectively.',
    },
    {
      icon: '📊',
      title: 'Column Management',
      description:
        'Create custom columns, rename them, reorder, and delete as needed. Adapt your board to any workflow.',
    },
    {
      icon: '📱',
      title: 'Responsive Design',
      description:
        'Work seamlessly across all devices. Our responsive design ensures a perfect experience on desktop, tablet, and mobile.',
    },
    {
      icon: '💾',
      title: 'LocalStorage Persistence',
      description:
        'Your tasks and boards are automatically saved locally. No data loss, even when you close your browser.',
    },
    {
      icon: '🔄',
      title: 'Real-time Updates',
      description:
        'See changes instantly as you work. Our reactive architecture ensures smooth, real-time workflow updates.',
    },
    {
      icon: '🎨',
      title: 'Modern Interface',
      description:
        'Clean, intuitive UI inspired by industry leaders. Professional design that enhances productivity.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description:
        'Built with Angular 19 for optimal performance. Experience blazing-fast load times and smooth interactions.',
    },
  ];
}
