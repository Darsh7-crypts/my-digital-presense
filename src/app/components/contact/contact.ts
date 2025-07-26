import { Component } from '@angular/core';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  readonly currentYear = new Date().getFullYear();

  readonly contactInfo: ContactInfo = {
    email: 'darsh.bopalkar7@gmail.com',
    phone: '+91 8007981191',
    location: 'Pune Maharashtra, India'
  };

  readonly socialLinks: SocialLink[] = [
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/yourprofile',
      icon: '👨‍💼'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/yourusername',
      icon: '🐱'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/darshaaaaaaaan?igsh=MTY0Z3dsODlya2p5dw%3D%3D&utm_source=qr',
      icon: '�'
    }
  ];

}
