import { Injectable } from '@angular/core';

export interface ExperienceItem {
  id: number;
  jobTitle: string;
  company: string;
  subCompany: string;
  location: string;
  period: string;
  details: string[];
}

export interface Project {
  id: number;
  title: string;
  category: string;
  description?: string;
  features: string[];
  duration: string;
  status: string;
  image?: string;
  demoLink?: string;
  codeLink?: string;
  achievements?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date?: string;
  category: string;
  issuer?: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {

  constructor() { }

  /**
   * Retrieves a list of experience items.
   * @returns An array of ExperienceItem objects.
   */
  public getExperience(): ExperienceItem[] {
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

  /**
   * Retrieves a list of projects.
   * @returns An array of Project objects.
   */
  public getProjects(): Project[] {
    return [
      {
        id: 1,
        title: 'Electrification-X',
        category: 'IT Software Developer',
        description: 'he Electrification-X project, within this project domain, monitors and controls EV charging station loads using graphical representations and single-line diagrams. One application which had multiple feature sets (PAM, EVC , CSE , SM etc.) managed with the help of micro front-end library NX. front-end used SiMPL (siemens internal UI -UX library) for building angular components.',
        features: [
          'Developed and optimized web applications using Angular (v13-17), improving performance and usability.',
          'Designed and implemented intuitive UI/UX solutions in Figma, ensuring consistency across web and mobile platforms.',
          'Architected and deployed micro-frontend solutions using Module Federation, successfully breaking down a monolithic application into 10 independent micro-frontends, reducing build time by 45% and enabling parallel development across 10 cross-functional teams.',
          'Created wireframes, prototypes, and interactive designs to enhance user engagement.',
        ],
        duration: '2 - Present',
        status: 'Production',
        demoLink: '',
        codeLink: '',
        achievements: 'Improved system performance by 200% and reduced load times by 40%'
      },
      {
        id: 2,
        title: 'NX power Monitor',
        category: 'Frontend',
        description: `This project falls under the electric domain and involves implementing various related products. Key elements include substations, switchgear, feeders, transformers, and motors, with capabilities to monitor Condition monitoring, Temperature Monitoring, current, voltage, energy, and more.`,
        features: [
          'Built 15+ reusable components using TypeScript.',
          'Achieved 90% unit test coverage using Jasmine and Karma',
          'Optimized existing web pages, ensuring cross-browser compatibility and accessibility.',
          'Collaborated with scrum teams, participated in sprint planning, standups, and backlog grooming.',
          'Comprehensive testing with 90% code coverage',
        ],
        duration: '2 years',
        status: 'Production',
        image: '',

      },
      {
        id: 3,
        title: 'PHED (HAR GHAR NAL JAL YOJANA)',
        category: 'Frontend',
        description: 'PHED stands for Public Health Engineering Department. We developed a web application to monitor water supply data for households in Bihar, including metrics such as water pressure, quantity supplied, water quality, and live water station status.',
         features: [
          'Developed and deployed interactive landing pages with HTML, CSS, JavaScript.',
          'Designed and implemented responsive UI components, improving user experience.',
          'Worked in an Agile environment, assisting in product releases and feature enhancements.',
          'Engaged in UX testing and design system implementation for consistent branding.',
        ],
        duration: '1 year',
        status: 'Production',
        image: '',
        demoLink: '',
        codeLink: '',
        achievements: 'Handles 1M+ daily requests with 99.9% uptime, reduced costs by 35%'
      }
    ];
  }

  /**
   * Retrieves a list of achievements.
   * @returns An array of Achievement objects.
   */
  public getAchievements(): Achievement[] {
    return [
      {
      id: 1,
      title: 'Werner von Siemens Award technology with purpose',
      category: 'Awards',
      issuer: 'Siemens',
      date: 'June 2022',
      icon: '🥇',
      description: 'Awarded the prestigious Werner von Siemens Award for the "Clean Drinking Water to every household - IoT Enabled solution- Mindsphere " project, which provided IoT-enabled solutions to ensure clean drinking water access for every household in Bihar, India. This project was recognized for its innovative use of Mindsphere technology in the PHED (HAR GHAR NAL JAL YOJANA) initiative.',
    },
      {
        id: 2,
        title: 'Beyond Call of Duty Award',
        category: 'Awards',
        issuer: 'Siemens',
        date: 'June 2024',
        icon: '🥇',
        description: 'Honored the Beyond Call of Duty Award for exceptional performance, resolving over 4,000 quality issues within just two months.'
      },
      {
        id: 3,
        title: 'Branding & Engagement Spark Team',
        category: 'Leadership',
        icon: '👑',
        description: `As administrator of the Branding & Engagement Spark team, I spearhead strategic branding initiatives, nurture creativity, and promote collaboration to elevate organizational engagement.Organized a variety of events, games, and team-building activities to foster a vibrant and connected workplace culture.`
      },
      {
        id: 4,
        title: 'Scrum Master',
        category: 'Leadership',
        icon: '👑',
        description: `Oversaw Scrum Master responsibilities:
              - Facilitated daily stand-ups for a 16-member cross-functional team, maintaining a 95% attendance rate.
              - Led bi-weekly sprint planning, achieving a 92% sprint goal completion rate.
              - Introduced improved estimation methods, reducing planning deviations.
              - Established a structured process for backlog grooming.`
      }
    ];
  }
}