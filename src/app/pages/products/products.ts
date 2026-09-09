import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  alertThreshold: number;
  purchasePrice: number;
  sellingPrice: number;
  user: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products {
  private fb = inject(FormBuilder);

  products = signal<Product[]>([
    { id: 1, name: 'MacBook Pro', category: 'Informatique', quantity: 45, alertThreshold: 10, purchasePrice: 2200000, sellingPrice: 3000000, user: 'Jean Mballa' },
    { id: 2, name: 'Onduleur APC', category: 'Énergie', quantity: 4, alertThreshold: 5, purchasePrice: 450000, sellingPrice: 600000, user: 'Awa Ngono' },
  ]);

  showModal = signal(false);
  editingProduct = signal<Product | null>(null);

  productForm = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    quantity: [0, Validators.min(0)],
    alertThreshold: [0, Validators.min(0)],
    purchasePrice: [0, Validators.min(0)],
    sellingPrice: [0, Validators.min(0)],
    user: ['', Validators.required],
  });

  openAdd() {
    this.editingProduct.set(null);
    this.productForm.reset();
    this.showModal.set(true);
  }

  openEdit(product: Product) {
    this.editingProduct.set(product);
    this.productForm.patchValue(product);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const form = this.productForm.value as any;
    if (this.editingProduct()) {
      // Modifier
      this.products.update(list =>
        list.map(p => p.id === this.editingProduct()!.id ? { ...p, ...form } : p)
      );
    } else {
      // Ajouter
      const newId = Math.max(...this.products().map(p => p.id)) + 1;
      this.products.update(list => [...list, { id: newId, ...form }]);
    }
    this.closeModal();
  }

  deleteProduct(id: number) {
    if (confirm('Supprimer ce produit ?')) {
      this.products.update(list => list.filter(p => p.id !== id));
    }
  }

  get margin() {
    return (p: Product) => p.sellingPrice - p.purchasePrice;
  }
}