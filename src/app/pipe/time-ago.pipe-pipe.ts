import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'TimeAgoPipe',
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: Date | string | null): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'à l\'instant';
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 2592000) return `il y a ${Math.floor(seconds / 86400)} j`;

    return date.toLocaleDateString('fr-FR');
  }
}
