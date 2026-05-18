import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { useState, useEffect } from "react";
import { useDarkmode } from "../stores/store";
import api from "../utils/axios";
import { useTokens } from "../stores/tokenStore";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    categoryId: "",
    price: 0,
    stockCount: 0,
  });

  const roles = useTokens((state) => state.roles);
  const isAdmin = roles.includes("Admin");

  const { isDarkmodeEnabled } = useDarkmode();

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getProducts = async () => {
    try {
      let res;

      if (selectedCategory) {
        res = await api.get(`/Product/${selectedCategory}/category`);
        let filtered = normalizeArray(res.data);

        if (searchTerm.length >= 1) {
          filtered = filtered.filter((p) =>
            p.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        setProducts(normalizeArray(filtered));
        setAllLoaded(true);
        return;
      }

      let url = `/Product/pagedResult?page=1&pageSize=10`;

      if (searchTerm.length >= 1) {
        url += `&search=${searchTerm}`;
      }

      res = await api.get(url);

      const items = normalizeArray(res.data);

      setProducts(normalizeArray(items));
      setPage(1);
      setAllLoaded(items.length < 10);
    } catch (error) {
      console.error(error);
      setProducts([]);
    }
  };

  const loadMore = async () => {
    if (selectedCategory) return;

    const nextPage = page + 1;

    let url = `/Product/pagedResult?page=${nextPage}&pageSize=10`;

    if (searchTerm.length >= 1) {
      url += `&search=${searchTerm}`;
    }

    const res = await api.get(url);

    const items = normalizeArray(res.data);

    setProducts((prev) => [...(Array.isArray(prev) ? prev : []), ...items]);
    setPage(nextPage);

    if (items.length < 10) setAllLoaded(true);
  };

  const showLess = () => {
    setProducts(products.slice(0, 10));
    setPage(1);
    setAllLoaded(false);
  };

  const getCategories = async () => {
    const res = await api.get("/Category");
    setCategories(normalizeArray(res.data));
  };

  const addProduct = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("categoryId", form.categoryId);
      formData.append("price", form.price);
      formData.append("stockCount", form.stockCount);

      await api.post("/Product", formData);

      setShowModal(false);

      setForm({
        name: "",
        title: "",
        description: "",
        categoryId: "",
        price: 0,
        stockCount: 0,
      });

      getProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const addCategory = async () => {
    try {
      await api.post("/Category", { name: newCategory });
      setNewCategory("");
      getCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/Category/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProducts();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkmodeEnabled
          ? "bg-[#1c1814] text-[#e6dccf]"
          : "bg-[#f4efe7] text-[#3a3835]"
      }`}
    >
      <Navbar
        searchterm={searchTerm}
        setSearchterm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <h2 className="text-center mt-16 mb-10 tracking-[3px] text-sm">
        BACK IN STOCK
      </h2>

      {isAdmin && (
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="border px-6 py-2 text-xs hover:bg-black hover:text-white"
          >
            ADD PRODUCT
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="border px-6 py-2 text-xs hover:bg-red-500 hover:text-white"
          >
            Manage category
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-6 px-12 max-w-7xl mx-auto">
        {products.map((product) => (
          <Card key={product.id} product={product} />
        ))}
      </div>

      <Footer />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-lg w-[400px] space-y-3">
            <h2 className="text-lg font-bold">Add Product</h2>

            <input
              placeholder="Name"
              className="border p-2 w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Title"
              className="border p-2 w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <select
              className="border p-2 w-full"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Price"
              className="border p-2 w-full"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              type="number"
              placeholder="Stock"
              className="border p-2 w-full"
              value={form.stockCount}
              onChange={(e) =>
                setForm({ ...form, stockCount: e.target.value })
              }
            />

            <button
              onClick={addProduct}
              className="bg-black text-white w-full py-2"
            >
              Save
            </button>

            <button onClick={() => setShowModal(false)} className="w-full">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-lg w-[400px] space-y-3">
            <h2 className="text-lg font-bold">Manage Categories</h2>

            <input
              placeholder="New Category"
              className="border p-2 w-full"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />

            <button
              onClick={addCategory}
              className="bg-black text-white w-full py-2"
            >
              Add
            </button>

            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span>{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="text-red-500"
                  >
                    delete
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCategoryModal(false)}
              className="w-full mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;