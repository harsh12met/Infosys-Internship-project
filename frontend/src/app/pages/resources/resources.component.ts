import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css',
})
export class ResourcesComponent {
  resources = [
    {
      icon: '📚',
      title: 'Kanban Guide',
      description:
        'Learn the fundamentals of Kanban methodology, best practices, and how to optimize your workflow for maximum productivity.',
      link: '#guide',
    },
    {
      icon: '💻',
      title: 'Remote Work Guide',
      description:
        'Discover strategies for managing remote teams, staying productive from anywhere, and maintaining work-life balance.',
      link: '#remote',
    },
    {
      icon: '🎥',
      title: 'Webinars',
      description:
        'Join live sessions and watch recordings from productivity experts sharing tips, tricks, and real-world case studies.',
      link: '#webinars',
    },
    {
      icon: '⭐',
      title: 'Customer Stories',
      description:
        'See how teams around the world use our Kanban board to achieve their goals and transform their workflows.',
      link: '#stories',
    },
    {
      icon: '👨‍💻',
      title: 'Developers',
      description:
        'Build custom integrations, extend functionality, and explore our API documentation for advanced customization.',
      link: '#developers',
    },
    {
      icon: '❓',
      title: 'Help Resources',
      description:
        'Find answers to common questions, troubleshooting guides, and get support when you need it most.',
      link: '#help',
    },
  ];

  guides = [
    {
      title: 'Getting Started with Kanban',
      duration: '5 min read',
      topics: ['Basics', 'Setup', 'First Board'],
    },
    {
      title: 'Advanced Task Management',
      duration: '8 min read',
      topics: ['Priorities', 'Custom Columns', 'Workflow'],
    },
    {
      title: 'Team Collaboration Tips',
      duration: '6 min read',
      topics: ['Teamwork', 'Communication', 'Best Practices'],
    },
  ];
}
