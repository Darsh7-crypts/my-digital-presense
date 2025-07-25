// src/app/services/portfolio-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {

  constructor() { }

  getExperience() {
    return [
      {
        id: 1,
        jobTitle: 'IT Software Developer & UI/UX Designer',
        company: 'Siemens Technology and Services PVT LTD',
        subCompany: '', // Empty subCompany for ID 1
        location: 'Bangalore, India',
        period: 'March 2023 - Present',
        details: [
          'Developed and optimized web applications using Angular (v13-17), improving performance and usability.',
          'Designed and implemented intuitive UI/UX solutions in Figma, ensuring consistency across web and mobile platforms.',
          'Architected and deployed micro-frontend solutions using Module Federation, successfully breaking down a monolithic application into 6 independent micro-frontends, reducing build time by 45% and enabling parallel development across 3 cross-functional teams.',
          'Created wireframes, prototypes, and interactive designs to enhance user engagement.',
          'Participated in Agile ceremonies, peer programming, and code reviews.',
          'Collaborated with a QA team of 6 members to implement automated testing strategies, achieving 85% test coverage and reducing post-release issues by 70%.',
          'Facilitated daily Agile ceremonies and conducted bi-weekly code reviews for a team of 12 members, achieving 90% code quality metrics and reducing bug reports by 60%.',
          'Designed and implemented UI/UX solutions in Figma for a team of 8 developers, creating 50+ reusable components that reduced development time by 35% and ensured 98% design consistency across platforms.'
        ]
      },
      {
        id: 2,
        jobTitle: 'Software Engineer',
        company: 'Siemens Technology and Services PVT LTD',
        subCompany: 'Randstad India',
        location: 'Bangalore, India',
        period: 'February 2022 - March 2023',
        details: [
          'Developed responsive web applications for Office 365 suite using Angular, TypeScript, and SASS',
          'Collaborated with UX/UI designers to implement pixel-perfect, accessible user interfaces',
          'Built reusable component library used by 20+ development teams',
          'Conducted code reviews and mentored 3 junior developers in modern frontend practices',
          'Implemented automated testing strategies using Jest, achieving 90% code coverage',
          'Developed and maintained NXPower monitor products, improving Web application responsiveness.',
          'Architecture & Development:',
          'Built 25+ reusable components using TypeScript.',
          'Implemented error boundary handling reducing crash incidents by 80%.',
          'Created responsive layouts supporting 5 different breakpoints.',
          'Achieved 90% unit test coverage using Jasmine and Karma.',
          'Optimized existing web pages, ensuring cross-browser compatibility and accessibility.',
          'Collaborated with scrum teams, participated in sprint planning, standups, and backlog grooming.'
        ]
      },
      {
        id: 3,
        jobTitle: 'Software Engineer',
        subCompany: 'ValueSoft Technologies',
        company: 'Siemens Technology and Services PVT LTD',
        location: 'Bangalore, India',
        period: 'Jan 2021 - Feb 2022',
        details: [
          'Built responsive websites and web applications using HTML5, CSS3, JavaScript',
          'Collaborated with design team to implement custom web components',
          'Developed and deployed interactive landing pages with HTML, CSS, JavaScript.',
          'Designed and implemented responsive UI components, improving user experience.',
          'Worked in an Agile environment, assisting in product releases and feature enhancements.',
          'Engaged in UX testing and design system implementation for consistent branding.',
          'Maintained and updated legacy systems while learning modern development practices',
          'Worked directly with clients to gather requirements and provide technical solutions'
        ]
      }
    ];
  }

  getProjects() {
    return [
      {
        id: 1,
        title: 'PHED (HAR GHAR NAL JAL YOJANA)',
        category: 'UI Developer',
        technologies: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'Bootstrap'],
        description: 'Enterprise-grade IoT platform dashboard serving 10,000+ connected industrial devices with real-time data visualization and analytics.',
        features: [
          'Real-time data visualization with D3.js and Chart.js',
          'Microservices architecture with 200% improved scalability',
          'Advanced caching strategies reducing load time by 40%',
          'Responsive design supporting multiple device types'
        ],
        duration: '9 months',
        status: 'Production',
        image: '/assets/images/mindosphere-dashboard.jpg',
        demoLink: '',
        codeLink: '',
        achievements: 'Improved system performance by 200% and reduced load times by 40%'
      },
      {
        id: 2,
        title: 'Office 365 Component Library',
        category: 'Frontend',
        technologies: ['React', 'TypeScript', 'SASS', 'Jest', 'Storybook'],
        description: 'Reusable component library used by 20+ development teams across Microsoft, featuring accessibility-first design principles.',
        features: [
          'WCAG 2.1 compliant accessible components',
          'Comprehensive testing with 90% code coverage',
          'Interactive documentation with Storybook',
          'Optimized for 95+ Lighthouse scores'
        ],
        duration: '8 months',
        status: 'Production',
        image: '/assets/images/office365-components.jpg',
        demoLink: 'https://components.office365.com',
        codeLink: 'https://github.com/microsoft/office365-components',
        achievements: 'Adopted by 20+ teams, achieved 95+ Lighthouse scores across all metrics'
      },
      {
        id: 3,
        title: 'AWS Serverless E-Commerce API',
        category: 'Backend',
        technologies: ['AWS Lambda', 'API Gateway', 'DynamoDB', 'CloudFormation', 'Node.js'],
        description: 'Scalable serverless e-commerce API handling 1M+ requests daily with 99.9% uptime and comprehensive monitoring.',
        features: [
          'Serverless architecture with auto-scaling',
          'Comprehensive CI/CD pipeline with AWS CodePipeline',
          'Real-time monitoring and alerting',
          'Cost optimization reducing infrastructure costs by 35%'
        ],
        duration: '4 months',
        status: 'Production',
        image: '/assets/images/aws-ecommerce-api.jpg',
        demoLink: '',
        codeLink: '',
        achievements: 'Handles 1M+ daily requests with 99.9% uptime, reduced costs by 35%'
      }
    ];
  }

  getAchievements() {
    return [
      {
        id: 1,
        title: 'Microsoft Certified: Azure Developer Associate',
        category: 'Certification',
        issuer: 'Microsoft',
        date: 'March 2023',
        icon: '🏆',
        description: 'Demonstrated expertise in developing and maintaining cloud applications on Microsoft Azure platform.',
        skills: ['Azure Functions', 'Azure Storage', 'Azure DevOps', 'Cloud Architecture'],
        credentialId: 'AZ-204',
        verificationLink: 'https://www.credly.com/badges/azure-developer-associate'
      },
      {
        id: 2,
        title: 'AWS Certified Solutions Architect',
        category: 'Certification',
        issuer: 'Amazon Web Services',
        date: 'November 2022',
        icon: '☁️',
        description: 'Proven ability to design and deploy scalable, highly available systems on AWS.',
        skills: ['EC2', 'S3', 'Lambda', 'CloudFormation', 'VPC'],
        credentialId: 'SAA-C03',
        verificationLink: 'https://www.credly.com/badges/aws-solutions-architect'
      },
      {
        id: 3,
        title: 'Google Cloud Professional Developer',
        category: 'Certification',
        issuer: 'Google Cloud',
        date: 'January 2024',
        icon: '🌐',
        description: 'Expertise in building scalable and reliable applications using Google Cloud Platform services.',
        skills: ['Cloud Functions', 'Kubernetes', 'BigQuery', 'Cloud Storage', 'Firebase'],
        credentialId: 'PCD-2024',
        verificationLink: 'https://cloud.google.com/certification/cloud-developer'
      }
    ];
  }
}