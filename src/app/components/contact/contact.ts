import { Component } from '@angular/core';

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact {
  public readonly currentYear = new Date().getFullYear();

  public readonly contactInfo: ContactInfo = {
    email: 'darsh.bopalkar7@gmail.com',
    phone: '+91 8007981191',
    location: 'Pune Maharashtra, India'
  };
}