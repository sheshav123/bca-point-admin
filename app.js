// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbGQvEoVsBqLYiiYsy_5JD3Xz6TUKIq0c",
    authDomain: "bca-point-2.firebaseapp.com",
    projectId: "bca-point-2",
    storageBucket: "bca-point-2.firebasestorage.app",
    messagingSenderId: "172385715450",
    appId: "1:172385715450:web:d87c9818b5990e82b0b543",
    measurementId: "G-HNGS5B7N9Y"
};

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Admin password (you can change this)
const ADMIN_PASSWORD = 'admin123';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const passwordLoginForm = document.getElementById('passwordLoginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        loginSection.style.display = 'none';
        adminSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        loadAllData();
    }

    // Password Login
    passwordLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            loginSection.style.display = 'none';
            adminSection.style.display = 'block';
            logoutBtn.style.display = 'block';
            loadAllData();
        } else {
            alert('Incorrect password!');
        }
    });

    // Sign Out
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminLoggedIn');
            loginSection.style.display = 'flex';
            adminSection.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    });

    // Tab Navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Categories
    document.getElementById('categoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('categoryTitle').value;
        const description = document.getElementById('categoryDescription').value;
        const order = parseInt(document.getElementById('categoryOrder').value);
        const isPremium = document.getElementById('categoryIsPremium').checked;
        
        try {
            await addDoc(collection(db, 'categories'), {
                title,
                description: description || null,
                order,
                isPremium: isPremium,
                createdAt: new Date().toISOString()
            });
            
            alert(isPremium ? '👑 Premium category added successfully!' : 'Category added successfully!');
            e.target.reset();
            loadCategories();
        } catch (error) {
            alert('Error adding category: ' + error.message);
        }
    });

    async function loadCategories() {
        const q = query(collection(db, 'categories'), orderBy('order'));
        const snapshot = await getDocs(q);
        
        const categoriesList = document.getElementById('categoriesList');
        const subcategoryParent = document.getElementById('subcategoryParent');
        
        categoriesList.innerHTML = '';
        subcategoryParent.innerHTML = '<option value="">Select Parent (Category or Subcategory)</option>';
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const isPremium = data.isPremium || false;
            
            // Add to list with edit button
            const item = document.createElement('div');
            item.className = 'item';
            item.style.borderLeft = isPremium ? '4px solid #ffc107' : '';
            item.innerHTML = `
                <div class="item-info">
                    <h3>
                        ${isPremium ? '<span style="color: #ffc107; margin-right: 8px;">👑</span>' : ''}
                        ${data.title}
                        ${isPremium ? '<span style="background: linear-gradient(135deg, #ffc107, #ff9800); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px; font-weight: bold;">PREMIUM</span>' : ''}
                    </h3>
                    <p>${data.description || 'No description'} • Order: ${data.order}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editCategory('${doc.id}', '${data.title.replace(/'/g, "\\'")}', '${(data.description || '').replace(/'/g, "\\'")}', ${data.order}, ${isPremium})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteCategory('${doc.id}')">Delete</button>
                </div>
            `;
            categoriesList.appendChild(item);
            
            // Add to parent select
            const option = document.createElement('option');
            option.value = `category_${doc.id}`;
            option.textContent = `${isPremium ? '👑 ' : '📁 '}${data.title}`;
            subcategoryParent.appendChild(option);
        });
    }

    window.editCategory = async (id, title, description, order, isPremium) => {
        const newTitle = prompt('Edit Category Title:', title);
        if (newTitle === null) return;
        
        const newDescription = prompt('Edit Description:', description);
        if (newDescription === null) return;
        
        const newOrder = prompt('Edit Order:', order);
        if (newOrder === null) return;
        
        const premiumStatus = confirm('Mark as Premium Category?\n\nClick OK for Premium, Cancel for Free');
        
        try {
            await updateDoc(doc(db, 'categories', id), {
                title: newTitle,
                description: newDescription || null,
                order: parseInt(newOrder),
                isPremium: premiumStatus
            });
            alert(premiumStatus ? '👑 Category updated as Premium!' : 'Category updated successfully!');
            loadAllData();
        } catch (error) {
            alert('Error updating category: ' + error.message);
        }
    };

    window.deleteCategory = async (id) => {
        if (confirm('Are you sure? This will also delete all subcategories and materials under this category.')) {
            try {
                await deleteDoc(doc(db, 'categories', id));
                alert('Category deleted successfully!');
                loadAllData();
            } catch (error) {
                alert('Error deleting category: ' + error.message);
            }
        }
    };

    // Subcategories
    document.getElementById('subcategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const parentValue = document.getElementById('subcategoryParent').value;
        const title = document.getElementById('subcategoryTitle').value;
        const description = document.getElementById('subcategoryDescription').value;
        const order = parseInt(document.getElementById('subcategoryOrder').value);
        
        // Parse parent type and ID
        const [parentType, parentId] = parentValue.split('_');
        
        try {
            await addDoc(collection(db, 'subcategories'), {
                parentType,
                parentId,
                title,
                description: description || null,
                order,
                createdAt: new Date().toISOString()
            });
            
            alert('Subcategory added successfully!');
            e.target.reset();
            loadAllData();
        } catch (error) {
            alert('Error adding subcategory: ' + error.message);
        }
    });

    async function loadSubcategories() {
        const q = query(collection(db, 'subcategories'), orderBy('order'));
        const snapshot = await getDocs(q);
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        
        const categoriesMap = {};
        categoriesSnapshot.forEach(doc => {
            categoriesMap[doc.id] = doc.data().title;
        });
        
        const subcategoriesMap = {};
        snapshot.forEach(doc => {
            subcategoriesMap[doc.id] = doc.data();
        });
        
        const subcategoriesList = document.getElementById('subcategoriesList');
        const materialSelect = document.getElementById('materialSubcategory');
        const subcategoryParent = document.getElementById('subcategoryParent');
        
        subcategoriesList.innerHTML = '';
        materialSelect.innerHTML = '<option value="">Select Subcategory</option>';
        
        // Helper function to build path
        function buildPath(subcatId, subcatsMap, catsMap) {
            const subcat = subcatsMap[subcatId];
            if (!subcat) return '';
            
            if (subcat.parentType === 'category') {
                return catsMap[subcat.parentId] || 'Unknown';
            } else {
                const parentPath = buildPath(subcat.parentId, subcatsMap, catsMap);
                return parentPath ? `${parentPath} > ${subcatsMap[subcat.parentId]?.title || 'Unknown'}` : '';
            }
        }
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const path = buildPath(doc.id, subcategoriesMap, categoriesMap);
            const fullPath = path ? `${path} > ${data.title}` : data.title;
            
            // Add to list with edit button
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="item-info">
                    <h3>${data.title}</h3>
                    <p>Path: ${fullPath} • ${data.description || 'No description'} • Order: ${data.order}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editSubcategory('${doc.id}', '${data.title.replace(/'/g, "\\'")}', '${(data.description || '').replace(/'/g, "\\'")}', ${data.order})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteSubcategory('${doc.id}')">Delete</button>
                </div>
            `;
            subcategoriesList.appendChild(item);
            
            // Add to material select
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = fullPath;
            materialSelect.appendChild(option);
            
            // Add to parent select
            const parentOption = document.createElement('option');
            parentOption.value = `subcategory_${doc.id}`;
            parentOption.textContent = `📂 ${fullPath}`;
            subcategoryParent.appendChild(parentOption);
        });
    }

    window.editSubcategory = async (id, title, description, order) => {
        const newTitle = prompt('Edit Subcategory Title:', title);
        if (newTitle === null) return;
        
        const newDescription = prompt('Edit Description:', description);
        if (newDescription === null) return;
        
        const newOrder = prompt('Edit Order:', order);
        if (newOrder === null) return;
        
        try {
            await updateDoc(doc(db, 'subcategories', id), {
                title: newTitle,
                description: newDescription || null,
                order: parseInt(newOrder)
            });
            alert('Subcategory updated successfully!');
            loadAllData();
        } catch (error) {
            alert('Error updating subcategory: ' + error.message);
        }
    };

    window.deleteSubcategory = async (id) => {
        if (confirm('Are you sure? This will also delete all nested subcategories and materials.')) {
            try {
                await deleteDoc(doc(db, 'subcategories', id));
                alert('Subcategory deleted successfully!');
                loadAllData();
            } catch (error) {
                alert('Error deleting subcategory: ' + error.message);
            }
        }
    };

    // Study Materials
    document.getElementById('materialForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subcategoryId = document.getElementById('materialSubcategory').value;
        const title = document.getElementById('materialTitle').value;
        const description = document.getElementById('materialDescription').value;
        const order = parseInt(document.getElementById('materialOrder').value);
        const file = document.getElementById('materialPdf').files[0];
        
        if (!file) {
            alert('Please select a PDF file');
            return;
        }
        
        try {
            // Show progress
            document.getElementById('uploadProgress').style.display = 'block';
            
            // Upload PDF
            const storageRef = ref(storage, `study_materials/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    document.getElementById('progressBar').value = progress;
                    document.getElementById('progressText').textContent = Math.round(progress) + '%';
                },
                (error) => {
                    alert('Upload error: ' + error.message);
                    document.getElementById('uploadProgress').style.display = 'none';
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    // Add to Firestore
                    await addDoc(collection(db, 'studyMaterials'), {
                        subcategoryId,
                        title,
                        description: description || null,
                        pdfUrl: downloadURL,
                        order,
                        createdAt: new Date().toISOString()
                    });
                    
                    alert('Study material uploaded successfully!');
                    e.target.reset();
                    document.getElementById('uploadProgress').style.display = 'none';
                    loadMaterials();
                }
            );
        } catch (error) {
            alert('Error uploading material: ' + error.message);
            document.getElementById('uploadProgress').style.display = 'none';
        }
    });

    async function loadMaterials() {
        const q = query(collection(db, 'studyMaterials'), orderBy('order'));
        const snapshot = await getDocs(q);
        const subcategoriesSnapshot = await getDocs(collection(db, 'subcategories'));
        
        const subcategoriesMap = {};
        subcategoriesSnapshot.forEach(doc => {
            subcategoriesMap[doc.id] = doc.data().title;
        });
        
        const materialsList = document.getElementById('materialsList');
        materialsList.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const subcategoryTitle = subcategoriesMap[data.subcategoryId] || 'Unknown';
            
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="item-info">
                    <h3>${data.title}</h3>
                    <p>Subcategory: ${subcategoryTitle} • ${data.description || 'No description'} • Order: ${data.order}</p>
                    <a href="${data.pdfUrl}" target="_blank" style="color: #667eea; font-size: 14px;">View PDF</a>
                </div>
                <div class="item-actions">
                    <button class="btn btn-edit" onclick="editMaterial('${doc.id}', '${data.title.replace(/'/g, "\\'")}', '${(data.description || '').replace(/'/g, "\\'")}', ${data.order})">Edit</button>
                    <button class="btn btn-delete" onclick="deleteMaterial('${doc.id}')">Delete</button>
                </div>
            `;
            materialsList.appendChild(item);
        });
    }

    window.editMaterial = async (id, title, description, order) => {
        const newTitle = prompt('Edit Material Title:', title);
        if (newTitle === null) return;
        
        const newDescription = prompt('Edit Description:', description);
        if (newDescription === null) return;
        
        const newOrder = prompt('Edit Order:', order);
        if (newOrder === null) return;
        
        try {
            await updateDoc(doc(db, 'studyMaterials', id), {
                title: newTitle,
                description: newDescription || null,
                order: parseInt(newOrder)
            });
            alert('Material updated successfully!');
            loadAllData();
        } catch (error) {
            alert('Error updating material: ' + error.message);
        }
    };

    window.deleteMaterial = async (id) => {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                await deleteDoc(doc(db, 'studyMaterials', id));
                alert('Material deleted successfully!');
                loadAllData();
            } catch (error) {
                alert('Error deleting material: ' + error.message);
            }
        }
    };

    // Load all data
    async function loadAllData() {
        await loadCategories();
        await loadSubcategories();
        await loadMaterials();
    }
});
