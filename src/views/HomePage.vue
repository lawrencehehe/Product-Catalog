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

// Firebase
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

import { db } from '../firebase/config';


// ============================
// PRODUCT INTERFACE
// ============================

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}


// ============================
// PRODUCTS
// ============================

const products = ref<Product[]>([]);
const searchText = ref('');
const showModal = ref(false);
const editingProduct = ref<Product | null>(null);


// ============================
// FORM
// ============================

const form = ref({
  name: '',
  price: '',
  category: '',
  stock: '',
  description: ''
});


// ============================
// FIREBASE COLLECTION
// ============================

const productsCollection = collection(db, 'products');


// ============================
// FILTER / SEARCH
// ============================

const filteredProducts = computed(() => {
  const search = searchText.value.toLowerCase().trim();

  return products.value.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.category.toLowerCase().includes(search)
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
// LOAD PRODUCTS FROM FIREBASE
// ============================

const loadProducts = async () => {
  try {

    const snapshot = await getDocs(productsCollection);

    products.value = snapshot.docs.map(document => ({
      id: document.id,
      ...document.data()
    })) as Product[];

  } catch (error) {

    console.error('Error loading products:', error);

    const alert = await alertController.create({
      header: 'Error',
      message: 'Unable to load products from Firebase.',
      buttons: ['OK']
    });

    await alert.present();
  }
};


// ============================
// LOAD WHEN PAGE STARTS
// ============================

onMounted(() => {
  loadProducts();
});


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

    const alert = await alertController.create({
      header: 'Missing Information',
      message: 'Please complete all required fields.',
      buttons: ['OK']
    });

    await alert.present();

    return;
  }

  try {

    if (editingProduct.value) {

      // UPDATE PRODUCT
      const productRef = doc(
        db,
        'products',
        editingProduct.value.id
      );

      await updateDoc(productRef, {
        name: form.value.name,
        price: Number(form.value.price),
        category: form.value.category,
        stock: Number(form.value.stock),
        description: form.value.description
      });

    } else {

      // CREATE PRODUCT
      await addDoc(productsCollection, {
        name: form.value.name,
        price: Number(form.value.price),
        category: form.value.category,
        stock: Number(form.value.stock),
        description: form.value.description
      });

    }

    await loadProducts();

    closeModal();

  } catch (error) {

    console.error('Error saving product:', error);

    const alert = await alertController.create({
      header: 'Error',
      message: 'Unable to save the product to Firebase.',
      buttons: ['OK']
    });

    await alert.present();
  }
};


// ============================
// EDIT
// ============================

const editProduct = (product: Product) => {

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

const deleteProduct = async (id: string) => {

  const alert = await alertController.create({

    header: 'Delete Product',

    message: 'Are you sure you want to delete this product?',

    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        role: 'destructive',

        handler: async () => {

          try {

            const productRef = doc(
              db,
              'products',
              id
            );

            await deleteDoc(productRef);

            await loadProducts();

          } catch (error) {

            console.error(
              'Error deleting product:',
              error
            );
          }
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


<!-- ======================================== -->
<!-- IONIC USER INTERFACE                     -->
<!-- ======================================== -->

<template>
  <IonPage class="catalog-page">

    <!-- HEADER -->
    <IonHeader class="ion-no-border">
      <IonToolbar class="main-toolbar">
        <IonTitle class="main-title">
          Product Catalog
        </IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent class="catalog-content">

      <div class="page-container">

        <!-- WELCOME BANNER -->
        <div class="welcome-card">
          <div class="welcome-text">
            <span class="welcome-small">WELCOME TO</span>

            <h1>Product Catalog</h1>

            <p>
              Manage your products easily and efficiently.
            </p>
          </div>

          <div class="welcome-icon">
            🛍️
          </div>
        </div>


        <!-- STATISTICS -->
        <div class="stats-grid">

          <!-- TOTAL PRODUCTS -->
          <div class="stat-card">
            <div class="stat-icon products-icon">
              📦
            </div>

            <div class="stat-info">
              <span>Total Products</span>
              <strong>{{ products.length }}</strong>
            </div>
          </div>


          <!-- TOTAL STOCK -->
          <div class="stat-card">
            <div class="stat-icon stock-icon">
              📊
            </div>

            <div class="stat-info">
              <span>Total Stock</span>
              <strong>{{ totalStock }}</strong>
            </div>
          </div>


          <!-- LOW STOCK -->
          <div class="stat-card">
            <div class="stat-icon low-icon">
              ⚠️
            </div>

            <div class="stat-info">
              <span>Low Stock</span>
              <strong>{{ lowStock }}</strong>
            </div>
          </div>

        </div>


        <!-- SEARCH -->
        <div class="search-container">
          <IonSearchbar
            v-model="searchText"
            placeholder="Search products..."
            class="custom-search"
          />
        </div>


        <!-- ADD PRODUCT -->
        <IonButton
          expand="block"
          class="add-button"
          @click="openAddForm"
        >
          <IonIcon
            slot="start"
            :icon="addOutline"
          />

          Add Product
        </IonButton>


        <!-- PRODUCTS HEADER -->
        <div class="products-heading">
          <h2>Products</h2>

          <p>
            {{ filteredProducts.length }}
            {{ filteredProducts.length === 1 ? 'product' : 'products' }}
            found
          </p>
        </div>


        <!-- EMPTY STATE -->
        <div
          v-if="filteredProducts.length === 0"
          class="empty-state"
        >
          <div class="empty-icon">
            📦
          </div>

          <h2>No Products Found</h2>

          <p>
            Start building your catalog by adding a product.
          </p>
        </div>


        <!-- PRODUCT CARDS -->
        <div
          v-else
          class="product-list"
        >

          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >

            <div class="product-top">

              <div class="product-symbol">
                📦
              </div>

              <div class="product-main-info">
                <h2>{{ product.name }}</h2>

                <span class="category-badge">
                  {{ product.category }}
                </span>
              </div>

            </div>


            <div class="product-details">

              <div class="detail-box">
                <span>Price</span>
                <strong>₱{{ product.price }}</strong>
              </div>

              <div class="detail-box">
                <span>Stock</span>
                <strong>{{ product.stock }}</strong>
              </div>

            </div>


            <p class="description">
              {{ product.description || 'No description provided.' }}
            </p>


            <div class="product-actions">

              <IonButton
                class="edit-button"
                @click="editProduct(product)"
              >
                <IonIcon
                  slot="start"
                  :icon="createOutline"
                />
                Edit
              </IonButton>

              <IonButton
                class="delete-button"
                @click="deleteProduct(product.id)"
              >
                <IonIcon
                  slot="start"
                  :icon="trashOutline"
                />
                Delete
              </IonButton>

            </div>

          </div>

        </div>

      </div>


      <!-- ADD / EDIT MODAL -->
      <IonModal
        :is-open="showModal"
        class="product-modal"
      >

        <IonHeader class="ion-no-border">
          <IonToolbar class="modal-toolbar">

            <IonTitle>
              {{
                editingProduct
                  ? 'Edit Product'
                  : 'Add Product'
              }}
            </IonTitle>

            <IonButtons slot="end">
              <IonButton
                class="close-button"
                @click="closeModal"
              >
                Close
              </IonButton>
            </IonButtons>

          </IonToolbar>
        </IonHeader>


        <IonContent class="modal-content">

          <div class="modal-form">

            <div class="modal-intro">
              <div class="modal-icon">
                📦
              </div>

              <h2>
                {{
                  editingProduct
                    ? 'Update Product'
                    : 'New Product'
                }}
              </h2>

              <p>
                {{
                  editingProduct
                    ? 'Update the information of your product.'
                    : 'Enter the information for your new product.'
                }}
              </p>
            </div>


            <IonItem class="form-item" lines="none">
              <IonInput
                v-model="form.name"
                label="Product Name"
                label-placement="stacked"
                placeholder="Enter product name"
              />
            </IonItem>


            <IonItem class="form-item" lines="none">
              <IonInput
                v-model="form.price"
                type="number"
                label="Price"
                label-placement="stacked"
                placeholder="Enter price"
              />
            </IonItem>


            <IonItem class="form-item" lines="none">
              <IonInput
                v-model="form.category"
                label="Category"
                label-placement="stacked"
                placeholder="Enter category"
              />
            </IonItem>


            <IonItem class="form-item" lines="none">
              <IonInput
                v-model="form.stock"
                type="number"
                label="Stock"
                label-placement="stacked"
                placeholder="Enter stock"
              />
            </IonItem>


            <IonItem class="form-item description-input" lines="none">
              <IonTextarea
                v-model="form.description"
                label="Description"
                label-placement="stacked"
                placeholder="Enter product description"
                :auto-grow="true"
              />
            </IonItem>


            <IonButton
              expand="block"
              class="save-button"
              @click="saveProduct"
            >
              {{
                editingProduct
                  ? 'Update Product'
                  : 'Save Product'
              }}
            </IonButton>

          </div>

        </IonContent>

      </IonModal>

    </IonContent>

  </IonPage>
</template>


<style scoped>

/* ============================= */
/* PAGE                          */
/* ============================= */

.catalog-page {
  --ion-background-color: #f4f6fb;
}

.catalog-content {
  --background: #f4f6fb;
}

.page-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 22px 60px;
}


/* ============================= */
/* HEADER                        */
/* ============================= */

.main-toolbar {
  --background: linear-gradient(
    135deg,
    #5146e5,
    #6c3ff2
  );

  --color: white;

  min-height: 76px;

  padding-left: 15px;
  padding-right: 15px;
}

.main-title {
  font-size: 24px;
  font-weight: 700;
}


/* ============================= */
/* WELCOME CARD                  */
/* ============================= */

.welcome-card {
  min-height: 200px;

  padding: 38px 42px;

  border-radius: 30px;

  background:
    linear-gradient(
      135deg,
      #5146e5 0%,
      #7b3ff2 100%
    );

  display: flex;
  align-items: center;
  justify-content: space-between;

  color: white;

  box-shadow:
    0 15px 35px rgba(81, 70, 229, 0.22);

  margin-bottom: 30px;
}

.welcome-small {
  font-size: 14px;
  letter-spacing: 4px;
  font-weight: 700;
  opacity: 0.85;
}

.welcome-text h1 {
  margin: 8px 0 10px;

  font-size: 34px;
  font-weight: 800;
}

.welcome-text p {
  margin: 0;

  font-size: 17px;
  opacity: 0.9;
}

.welcome-icon {
  font-size: 75px;
  margin-left: 30px;
}


/* ============================= */
/* STATISTICS                    */
/* ============================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 18px;

  margin-bottom: 28px;
}

.stat-card {
  background: white;

  border-radius: 22px;

  padding: 24px;

  display: flex;
  align-items: center;

  gap: 18px;

  box-shadow:
    0 8px 25px rgba(31, 38, 70, 0.07);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);

  box-shadow:
    0 12px 30px rgba(31, 38, 70, 0.11);
}

.stat-icon {
  width: 64px;
  height: 64px;

  border-radius: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 29px;

  flex-shrink: 0;
}

.products-icon {
  background: #e8e8ff;
}

.stock-icon {
  background: #ddfaeb;
}

.low-icon {
  background: #fff2c7;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-info span {
  color: #777d8c;

  font-size: 14px;

  margin-bottom: 3px;
}

.stat-info strong {
  color: #171925;

  font-size: 29px;

  line-height: 1;
}


/* ============================= */
/* SEARCH                        */
/* ============================= */

.search-container {
  margin-bottom: 15px;
}

.custom-search {
  padding: 0;

  --background: white;

  --border-radius: 17px;

  --box-shadow:
    0 5px 18px rgba(31, 38, 70, 0.1);

  --placeholder-color: #969aa6;

  --icon-color: #777d8c;

  min-height: 58px;
}


/* ============================= */
/* ADD BUTTON                    */
/* ============================= */

.add-button {
  --background: #5547e8;

  --background-hover: #4639d7;

  --border-radius: 17px;

  --box-shadow:
    0 8px 20px rgba(85, 71, 232, 0.25);

  height: 58px;

  margin: 0 0 40px;

  font-size: 16px;

  font-weight: 700;

  letter-spacing: 1px;
}


/* ============================= */
/* PRODUCTS HEADER               */
/* ============================= */

.products-heading {
  margin: 0 5px 20px;
}

.products-heading h2 {
  color: #171925;

  margin: 0;

  font-size: 27px;

  font-weight: 800;
}

.products-heading p {
  margin: 6px 0 0;

  color: #7c8190;

  font-size: 15px;
}


/* ============================= */
/* EMPTY STATE                   */
/* ============================= */

.empty-state {
  text-align: center;

  padding: 55px 20px 70px;

  color: #777d8c;
}

.empty-icon {
  width: 115px;
  height: 115px;

  margin: 0 auto 25px;

  border-radius: 50%;

  background: #eceeff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 52px;
}

.empty-state h2 {
  color: #171925;

  font-size: 25px;

  margin-bottom: 10px;
}

.empty-state p {
  margin: 0;

  font-size: 15px;
}


/* ============================= */
/* PRODUCT CARDS                 */
/* ============================= */

.product-list {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 20px;
}

.product-card {
  background: white;

  border-radius: 23px;

  padding: 24px;

  box-shadow:
    0 8px 25px rgba(31, 38, 70, 0.08);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-3px);

  box-shadow:
    0 14px 32px rgba(31, 38, 70, 0.12);
}

.product-top {
  display: flex;

  align-items: center;

  gap: 16px;

  margin-bottom: 22px;
}

.product-symbol {
  width: 58px;
  height: 58px;

  border-radius: 17px;

  background: #eceeff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 29px;

  flex-shrink: 0;
}

.product-main-info h2 {
  margin: 0 0 7px;

  color: #171925;

  font-size: 20px;

  font-weight: 750;
}

.category-badge {
  display: inline-block;

  background: #eeeefe;

  color: #5749dc;

  padding: 5px 10px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 600;
}

.product-details {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;

  margin-bottom: 18px;
}

.detail-box {
  background: #f7f8fc;

  border-radius: 14px;

  padding: 13px 15px;

  display: flex;

  flex-direction: column;

  gap: 4px;
}

.detail-box span {
  color: #898e9b;

  font-size: 12px;
}

.detail-box strong {
  color: #20222d;

  font-size: 16px;
}

.description {
  color: #707583;

  font-size: 14px;

  line-height: 1.6;

  min-height: 44px;
}

.product-actions {
  display: flex;

  gap: 10px;

  margin-top: 18px;
}

.product-actions IonButton {
  flex: 1;
}

.edit-button {
  --background: #5547e8;

  --border-radius: 12px;
}

.delete-button {
  --background: #fff0f1;

  --color: #e54855;

  --border-radius: 12px;

  --box-shadow: none;
}


/* ============================= */
/* MODAL                         */
/* ============================= */

.product-modal {
  --width: 520px;

  --height: 720px;

  --border-radius: 25px;
}

.modal-toolbar {
  --background: #5547e8;

  --color: white;

  padding: 7px;
}

.close-button {
  --color: white;
}

.modal-content {
  --background: #f6f7fb;
}

.modal-form {
  padding: 25px;
}

.modal-intro {
  text-align: center;

  margin-bottom: 25px;
}

.modal-icon {
  width: 70px;
  height: 70px;

  margin: 0 auto 12px;

  background: #eceeff;

  border-radius: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 34px;
}

.modal-intro h2 {
  color: #171925;

  margin: 0 0 7px;

  font-size: 23px;
}

.modal-intro p {
  color: #7c8190;

  margin: 0;

  font-size: 14px;
}

.form-item {
  --background: white;

  --border-radius: 14px;

  --padding-start: 16px;

  --inner-padding-end: 16px;

  margin-bottom: 13px;

  box-shadow:
    0 3px 12px rgba(31, 38, 70, 0.05);
}

.description-input {
  min-height: 95px;
}

.save-button {
  --background: #5547e8;

  --border-radius: 15px;

  --box-shadow:
    0 7px 18px rgba(85, 71, 232, 0.25);

  height: 55px;

  margin-top: 22px;

  font-weight: 700;
}


/* ============================= */
/* MOBILE RESPONSIVE             */
/* ============================= */

@media (max-width: 700px) {

  .page-container {
    padding:
      22px 17px 50px;
  }

  .main-toolbar {
    min-height: 70px;
  }

  .main-title {
    font-size: 21px;
  }

  .welcome-card {
    padding:
      30px 25px;

    min-height: 180px;

    border-radius: 25px;
  }

  .welcome-text h1 {
    font-size: 28px;
  }

  .welcome-text p {
    font-size: 15px;
  }

  .welcome-icon {
    font-size: 55px;

    margin-left: 15px;
  }

  .stats-grid {
    grid-template-columns: 1fr;

    gap: 14px;
  }

  .stat-card {
    padding: 20px;
  }

  .product-list {
    grid-template-columns: 1fr;
  }

  .product-modal {
    --width: 100%;

    --height: 90%;

    --border-radius: 25px 25px 0 0;
  }

}


/* SMALL PHONES */
@media (max-width: 430px) {

  .welcome-card {
    padding: 27px 22px;
  }

  .welcome-text h1 {
    font-size: 24px;
  }

  .welcome-icon {
    font-size: 43px;
  }

  .stat-icon {
    width: 57px;
    height: 57px;
  }

  .product-actions {
    flex-direction: column;
  }

}

</style>