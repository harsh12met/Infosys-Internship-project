import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  technologies = [
    {
      name: 'Angular',
      icon: '🅰️',
      description:
        'Modern frontend framework with standalone components architecture',
    },
    {
      name: 'TypeScript',
      icon: '📘',
      description: 'Type-safe JavaScript for robust development',
    },
    {
      name: 'Node.js',
      icon: '🟢',
      description: 'JavaScript runtime for backend API',
    },
    {
      name: 'Express',
      icon: '⚡',
      description: 'Fast, minimalist web framework for Node.js',
    },
    {
      name: 'RxJS',
      icon: '🔄',
      description: 'Reactive programming with observables',
    },
    {
      name: 'Angular CDK',
      icon: '🎯',
      description: 'Component dev kit for drag-and-drop functionality',
    },
  ];

  features = [
    'Drag-and-drop task management',
    'Customizable Kanban columns',
    'Task priorities and status tracking',
    'LocalStorage data persistence',
    'Responsive design for all devices',
    'Real-time UI updates',
  ];

  goals = [
    {
      title: 'Enhanced Backend',
      description:
        'Implement MongoDB database for persistent storage and user authentication',
    },
    {
      title: 'Team Collaboration',
      description: 'Add real-time multi-user collaboration with WebSockets',
    },
    {
      title: 'Advanced Features',
      description:
        'Task comments, file attachments, due dates, and notifications',
    },
    {
      title: 'Mobile App',
      description: 'Native mobile applications for iOS and Android',
    },
  ];
}
