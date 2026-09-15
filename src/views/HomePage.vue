<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="main-header">
      <ion-toolbar>
        <ion-title>Product Catalog</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="catalog-content">

      <!-- HERO SECTION -->
      <div class="hero-section">
        <div>
          <p class="welcome-text">WELCOME TO</p>
          <h1>Product Catalog</h1>
          <p class="hero-description">
            Manage your products easily and efficiently.
          </p>
        </div>

        <div class="hero-icon">
          🛍️
        </div>
      </div>


      <!-- STATISTICS -->
      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon products-icon">
            📦
          </div>

          <div>
            <p>Total Products</p>
            <h2>{{ products.length }}</h2>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon stock-icon">
            📊
          </div>

          <div>
            <p>Total Stock</p>
            <h2>{{ totalStock }}</h2>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon low-icon">
            ⚠️
          </div>

          <div>
            <p>Low Stock</p>
            <h2>{{ lowStock }}</h2>
          </div>
        </div>

      </div>


      <!-- SEARCH + ADD -->
      <div class="control-section">

        <div class="search-wrapper">

          <ion-searchbar
  v-model="searchText"
  placeholder="Search products..."
  show-clear-button="always"
></ion-searchbar>

        </div>

        <ion-button
          class="add-button"
          @click="openAddForm"
        >
          <ion-icon
            :icon="addOutline"
            slot="start"
          ></ion-icon>

          Add Product
        </ion-button>

      </div>


      <!-- PRODUCT SECTION HEADER -->
      <div class="section-header">

        <div>
          <h2>Products</h2>

          <p>
            {{ filteredProducts.length }}
            product{{ filteredProducts.length !== 1 ? 's' : '' }}
            found
          </p>
        </div>

      </div>


      <!-- PRODUCT GRID -->
      <div
        v-if="filteredProducts.length > 0"
        class="product-grid"
      >

        <ion-card
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
        >

          <!-- PRODUCT IMAGE PLACEHOLDER -->
          <div class="product-image">
            <span>📦</span>
          </div>


          <ion-card-header>

            <div class="category-badge">
              {{ product.category }}
            </div>

            <ion-card-title>
              {{ product.name }}
            </ion-card-title>

          </ion-card-header>


          <ion-card-content>

            <p class="description">
              {{ product.description || 'No description available.' }}
            </p>


            <!-- PRICE -->
            <div class="product-info">

              <div>
                <span class="info-label">Price</span>

                <strong class="price">
                  ₱{{ product.price.toLocaleString() }}
                </strong>
              </div>


              <div>
                <span class="info-label">Stock</span>

                <span
                  class="stock-badge"
                  :class="{
                    'low-stock': product.stock <= 5,
                    'out-stock': product.stock === 0
                  }"
                >
                  {{ product.stock }} available
                </span>
              </div>

            </div>


            <!-- ACTIONS -->
            <div class="button-container">

              <ion-button
                class="edit-button"
                fill="outline"
                @click="editProduct(product)"
              >
                <ion-icon
                  :icon="createOutline"
                  slot="start"
                ></ion-icon>

                Edit
              </ion-button>


              <ion-button
                class="delete-button"
                fill="outline"
                color="danger"
                @click="deleteProduct(product.id)"
              >
                <ion-icon
                  :icon="trashOutline"
                  slot="start"
                ></ion-icon>

                Delete
              </ion-button>

            </div>

          </ion-card-content>

        </ion-card>

      </div>


      <!-- EMPTY STATE -->
      <div
        v-else
        class="empty-state"
      >

        <div class="empty-icon">
          📦
        </div>

        <h2>No Products Found</h2>

        <p>
          {{ searchText
            ? 'Try searching for another product.'
            : 'Start building your catalog by adding a product.'
          }}
        </p>

        <ion-button
          v-if="!searchText"
          @click="openAddForm"
        >
          <ion-icon
            :icon="addOutline"
            slot="start"
          ></ion-icon>

          Add Your First Product
        </ion-button>

      </div>


      <!-- ADD / EDIT MODAL -->
      <ion-modal
        :is-open="showModal"
        @didDismiss="closeModal"
      >

        <ion-header>

          <ion-toolbar>

            <ion-title>
              {{ editingProduct ? 'Edit Product' : 'Add Product' }}
            </ion-title>

            <ion-buttons slot="end">

              <ion-button
                @click="closeModal"
              >
                Close
              </ion-button>

            </ion-buttons>

          </ion-toolbar>

        </ion-header>


        <ion-content class="modal-content ion-padding">

          <div class="form-header">

            <div class="form-icon">
              {{ editingProduct ? '✏️' : '📦' }}
            </div>

            <div>

              <h2>
                {{ editingProduct
                  ? 'Update Product'
                  : 'Add New Product'
                }}
              </h2>

              <p>
                {{
                  editingProduct
                    ? 'Update the product information below.'
                    : 'Enter the details of your new product.'
                }}
              </p>

            </div>

          </div>


          <ion-item class="form-item">

            <ion-input
              v-model="form.name"
              label="Product Name"
              label-placement="floating"
              placeholder="e.g. Wireless Headphones"
            ></ion-input>

          </ion-item>


          <ion-item class="form-item">

            <ion-input
              v-model="form.price"
              type="number"
              label="Price"
              label-placement="floating"
              placeholder="e.g. 1299"
            ></ion-input>

          </ion-item>


          <ion-item class="form-item">

            <ion-input
              v-model="form.category"
              label="Category"
              label-placement="floating"
              placeholder="e.g. Electronics"
            ></ion-input>

          </ion-item>


          <ion-item class="form-item">

            <ion-input
              v-model="form.stock"
              type="number"
              label="Stock Quantity"
              label-placement="floating"
              placeholder="e.g. 15"
            ></ion-input>

          </ion-item>


          <ion-item class="form-item">

            <ion-textarea
              v-model="form.description"
              label="Description"
              label-placement="floating"
              placeholder="Describe your product..."
              :auto-grow="true"
            ></ion-textarea>

          </ion-item>


          <ion-button
            expand="block"
            class="save-button"
            @click="saveProduct"
          >

            <ion-icon
              :icon="editingProduct ? createOutline : addOutline"
              slot="start"
            ></ion-icon>

            {{ editingProduct ? 'Update Product' : 'Save Product' }}

          </ion-button>


        </ion-content>

      </ion-modal>

    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">

import {
  ref,
  computed,
  onMounted
} from 'vue';

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButtons,
  IonItem,
  IonInput,
  IonTextarea,
  alertController
} from '@ionic/vue';

import {
  addOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';


interface Product {

  id: number;

  name: string;

  price: number;

  category: string;

  stock: number;

  description: string;

}


const products = ref<Product[]>([]);

const searchText = ref('');

const showModal = ref(false);

const editingProduct = ref<Product | null>(null);


const form = ref({

  name: '',

  price: '',

  category: '',

  stock: '',

  description: ''

});


// ============================
// FILTER / SEARCH
// ============================

const filteredProducts = computed(() => {

  const search = searchText.value
    .toLowerCase()
    .trim();

  return products.value.filter(product =>

    product.name
      .toLowerCase()
      .includes(search)

    ||

    product.category
      .toLowerCase()
      .includes(search)

  );

});


// ============================
// STATISTICS
// ============================

const totalStock = computed(() => {

  return products.value.reduce(
    (total, product) => total + product.stock,
    0
  );

});


const lowStock = computed(() => {

  return products.value.filter(
    product => product.stock <= 5
  ).length;

});


// ============================
// LOAD PRODUCTS
// ============================

onMounted(() => {

  const savedProducts =
    localStorage.getItem('products');

  if (savedProducts) {

    products.value =
      JSON.parse(savedProducts);

  }

});


// ============================
// SAVE STORAGE
// ============================

const saveToStorage = () => {

  localStorage.setItem(
    'products',
    JSON.stringify(products.value)
  );

};


// ============================
// OPEN ADD FORM
// ============================

const openAddForm = () => {

  editingProduct.value = null;

  form.value = {

    name: '',

    price: '',

    category: '',

    stock: '',

    description: ''

  };

  showModal.value = true;

};


// ============================
// CREATE + UPDATE
// ============================

const saveProduct = async () => {

  if (

    !form.value.name ||

    !form.value.price ||

    !form.value.category ||

    !form.value.stock

  ) {

    const alert =
      await alertController.create({

        header: 'Missing Information',

        message:
          'Please complete all required fields.',

        buttons: ['OK']

      });

    await alert.present();

    return;

  }


  if (editingProduct.value) {

    // UPDATE

    const index =
      products.value.findIndex(

        product =>
          product.id ===
          editingProduct.value?.id

      );


    if (index !== -1) {

      products.value[index] = {

        id: editingProduct.value.id,

        name: form.value.name,

        price: Number(form.value.price),

        category: form.value.category,

        stock: Number(form.value.stock),

        description:
          form.value.description

      };

    }

  }

  else {

    // CREATE

    const newProduct: Product = {

      id: Date.now(),

      name: form.value.name,

      price: Number(form.value.price),

      category: form.value.category,

      stock: Number(form.value.stock),

      description:
        form.value.description

    };


    products.value.push(newProduct);

  }


  saveToStorage();

  closeModal();

};


// ============================
// EDIT
// ============================

const editProduct =
  (product: Product) => {

    editingProduct.value = product;

    form.value = {

      name: product.name,

      price: String(product.price),

      category: product.category,

      stock: String(product.stock),

      description: product.description

    };

    showModal.value = true;

  };


// ============================
// DELETE
// ============================

const deleteProduct =
  async (id: number) => {

    const alert =
      await alertController.create({

        header: 'Delete Product',

        message:
          'Are you sure you want to delete this product?',

        buttons: [

          {

            text: 'Cancel',

            role: 'cancel'

          },

          {

            text: 'Delete',

            role: 'destructive',

            handler: () => {

              products.value =
                products.value.filter(

                  product =>
                    product.id !== id

                );

              saveToStorage();

            }

          }

        ]

      });


    await alert.present();

  };


// ============================
// CLOSE MODAL
// ============================

const closeModal = () => {

  showModal.value = false;

  editingProduct.value = null;

};

</script>


<style scoped>

/* ============================
   GENERAL
============================ */

.catalog-content {
  --background: #f5f7fb;
}


/* ============================
   HEADER
============================ */

.main-header ion-toolbar {
  --background: #4f46e5;
  --color: white;
}

.main-header ion-title {
  font-weight: 700;
}


/* ============================
   HERO
============================ */

.hero-section {

  margin: 20px;

  padding: 28px;

  border-radius: 22px;

  background:
    linear-gradient(
      135deg,
      #4f46e5,
      #7c3aed
    );

  color: white;

  display: flex;

  justify-content: space-between;

  align-items: center;

  box-shadow:
    0 10px 30px
    rgba(79, 70, 229, 0.25);

}

.welcome-text {

  font-size: 12px;

  font-weight: 700;

  letter-spacing: 2px;

  opacity: 0.8;

  margin: 0 0 5px;

}

.hero-section h1 {

  margin: 0;

  font-size: 30px;

  font-weight: 800;

}

.hero-description {

  margin: 8px 0 0;

  opacity: 0.9;

}

.hero-icon {

  font-size: 55px;

}


/* ============================
   STATISTICS
============================ */

.stats-grid {

  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 15px;

  margin: 20px;

}

.stat-card {

  background: white;

  border-radius: 18px;

  padding: 18px;

  display: flex;

  align-items: center;

  gap: 14px;

  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, 0.06);

}

.stat-icon {

  width: 48px;

  height: 48px;

  border-radius: 14px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 23px;

}

.products-icon {

  background: #e0e7ff;

}

.stock-icon {

  background: #dcfce7;

}

.low-icon {

  background: #fef3c7;

}

.stat-card p {

  margin: 0;

  font-size: 12px;

  color: #6b7280;

}

.stat-card h2 {

  margin: 3px 0 0;

  font-size: 24px;

  color: #111827;

}


/* ============================
   CONTROLS
============================ */

.control-section {

  margin: 25px 20px;

  display: flex;

  gap: 15px;

  align-items: center;

}

.search-wrapper {

  flex: 1;

}

.search-wrapper ion-searchbar {

  --background: white;

  --border-radius: 14px;

  padding: 0;

}

.add-button {

  --background: #4f46e5;

  --border-radius: 12px;

  height: 48px;

  font-weight: 600;

  margin: 0;

}


/* ============================
   SECTION HEADER
============================ */

.section-header {

  margin: 30px 20px 10px;

}

.section-header h2 {

  margin: 0;

  font-size: 23px;

  font-weight: 750;

  color: #111827;

}

.section-header p {

  margin: 5px 0;

  color: #6b7280;

  font-size: 14px;

}


/* ============================
   PRODUCT GRID
============================ */

.product-grid {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 20px;

  margin: 20px;

}


/* ============================
   PRODUCT CARD
============================ */

.product-card {

  margin: 0;

  background: white;

  border-radius: 20px;

  overflow: hidden;

  box-shadow:
    0 6px 20px
    rgba(0, 0, 0, 0.07);

  transition:
    transform 0.2s ease;

}

.product-card:hover {

  transform: translateY(-4px);

}

.product-image {

  height: 150px;

  background:
    linear-gradient(
      135deg,
      #eef2ff,
      #ede9fe
    );

  display: flex;

  align-items: center;

  justify-content: center;

}

.product-image span {

  font-size: 60px;

}

.product-card ion-card-header {

  padding-bottom: 5px;

}

.category-badge {

  display: inline-block;

  background: #eef2ff;

  color: #4f46e5;

  padding: 5px 10px;

  border-radius: 20px;

  font-size: 11px;

  font-weight: 700;

  margin-bottom: 8px;

}

.product-card ion-card-title {

  font-size: 20px;

  font-weight: 750;

  color: #111827;

}

.product-card ion-card-content {

  padding-top: 8px;

}

.description {

  color: #6b7280;

  font-size: 13px;

  line-height: 1.5;

  min-height: 40px;

}


/* ============================
   PRODUCT INFO
============================ */

.product-info {

  display: flex;

  justify-content: space-between;

  align-items: end;

  margin-top: 18px;

  padding-top: 15px;

  border-top:
    1px solid #f0f0f0;

}

.info-label {

  display: block;

  font-size: 11px;

  color: #9ca3af;

  margin-bottom: 3px;

}

.price {

  font-size: 20px;

  color: #4f46e5;

}

.stock-badge {

  display: inline-block;

  background: #dcfce7;

  color: #166534;

  padding: 5px 9px;

  border-radius: 8px;

  font-size: 11px;

  font-weight: 700;

}

.low-stock {

  background: #fef3c7;

  color: #92400e;

}

.out-stock {

  background: #fee2e2;

  color: #991b1b;

}


/* ============================
   BUTTONS
============================ */

.button-container {

  display: flex;

  gap: 8px;

  margin-top: 18px;

}

.button-container ion-button {

  flex: 1;

  height: 38px;

  margin: 0;

  --border-radius: 10px;

  font-size: 12px;

  font-weight: 600;

}

.edit-button {

  --color: #4f46e5;

  --border-color: #c7d2fe;

}

.delete-button {

  --border-color: #fecaca;

}


/* ============================
   EMPTY STATE
============================ */

.empty-state {

  text-align: center;

  margin: 80px 20px;

}

.empty-icon {

  width: 90px;

  height: 90px;

  margin: auto;

  border-radius: 50%;

  background: #eef2ff;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 40px;

}

.empty-state h2 {

  margin-top: 20px;

  color: #111827;

}

.empty-state p {

  color: #6b7280;

  margin-bottom: 25px;

}


/* ============================
   MODAL
============================ */

.modal-content {

  --background: #f8fafc;

}

.form-header {

  display: flex;

  align-items: center;

  gap: 15px;

  margin-bottom: 25px;

}

.form-icon {

  width: 55px;

  height: 55px;

  border-radius: 15px;

  background: #e0e7ff;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 25px;

}

.form-header h2 {

  margin: 0;

  font-size: 22px;

  color: #111827;

}

.form-header p {

  margin: 4px 0 0;

  color: #6b7280;

  font-size: 13px;

}

.form-item {

  --background: white;

  --border-radius: 12px;

  --border-color: #e5e7eb;

  margin-bottom: 14px;

  border-radius: 12px;

}

.save-button {

  --background: #4f46e5;

  --border-radius: 12px;

  height: 50px;

  margin-top: 25px;

  font-weight: 700;

}


/* ============================
   RESPONSIVE
============================ */

@media (max-width: 700px) {

  .stats-grid {

    grid-template-columns: 1fr;

  }

  .product-grid {

    grid-template-columns: 1fr;

  }

  .control-section {

    flex-direction: column;

    align-items: stretch;

  }

  .add-button {

    width: 100%;

  }

  .hero-section h1 {

    font-size: 24px;

  }

}

</style>