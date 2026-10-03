export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'stock' | 'vente' | 'systeme';
}
