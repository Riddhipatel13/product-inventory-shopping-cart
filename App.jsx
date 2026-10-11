import { useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import products from './data/products'

const money = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(amount)

function Header({ cartCount }) {
  return (
    <header className="topbar">
      <Link className="brand" to="/">🛍️ Product Store</Link>
      <nav>
        <NavLink to="/" end>Products</NavLink>
        <NavLink to="/cart">Cart <span className="cart-count">{cartCount}</span></NavLink>
      </nav>
    </header>
  )
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="image-link">
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="product-info">
        <span className="category-tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">{money(product.price)}</p>
        <p className="stock">In stock: {product.quantity}</p>
        <div className="card-actions">
          <Link className="button secondary" to={`/products/${product.id}`}>View Details</Link>
          <button className="button" onClick={() => onAdd(product)} disabled={product.quantity < 1}>Add to Cart</button>
        </div>
      </div>
    </article>
  )
}

function ProductList({ onAdd }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category))],
    []
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(term)
      const matchesCategory = category === 'All' || product.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  return (
    <main className="container">
      <section className="hero">
        <div>
          <p className="eyebrow">GSFC UNIVERSITY · AWT PRACTICAL</p>
          <h1>Find your next essential.</h1>
          <p className="hero-text">Browse products, filter by category, and manage your shopping cart.</p>
        </div>
        <div className="hero-icon">🛒</div>
      </section>

      <section className="toolbar" aria-label="Product filters">
        <label className="search-field">
          <span>Search products</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try Laptop or Mouse..." />
        </label>
        <label className="category-field">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <div className="section-heading">
        <h2>Products</h2>
        <span>{filteredProducts.length} item(s) found</span>
      </div>
      {filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
        </div>
      ) : (
        <div className="empty-state"><h3>No products found</h3><p>Try another search or category.</p></div>
      )}
    </main>
  )
}

function ProductDetails({ onAdd }) {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))

  if (!product) {
    return <main className="container empty-state"><h2>Product not found</h2><Link to="/">Back to products</Link></main>
  }

  return (
    <main className="container">
      <Link to="/" className="back-link">← Back to products</Link>
      <section className="details-card">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="category-tag">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="details-price">{money(product.price)}</p>
          <p><strong>Product ID:</strong> {product.id}</p>
          <p><strong>Available quantity:</strong> {product.quantity}</p>
          <p className="muted">A useful choice for everyday study, work, or home needs.</p>
          <button className="button" onClick={() => onAdd(product)} disabled={product.quantity < 1}>Add to Cart</button>
        </div>
      </section>
    </main>
  )
}

function Cart({ cart, onChangeQuantity, onRemove }) {
  const navigate = useNavigate()
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0),
    [cart]
  )
  const totalItems = cart.reduce((sum, item) => sum + item.cartQuantity, 0)

  if (cart.length === 0) {
    return (
      <main className="container">
        <div className="section-heading"><h1>Your Cart</h1></div>
        <div className="empty-state">
          <div className="empty-icon">🛒</div><h2>Your cart is empty</h2>
          <p>Add a product to see it here.</p><Link className="button" to="/">Browse Products</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container">
      <div className="section-heading"><h1>Your Cart</h1><span>{totalItems} item(s)</span></div>
      <div className="cart-layout">
        <section className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3><p>{money(item.price)} each</p>
                <button className="text-button danger" onClick={() => onRemove(item.id)}>Remove</button>
              </div>
              <div className="quantity-control">
                <button aria-label={`Decrease ${item.name} quantity`} onClick={() => onChangeQuantity(item.id, -1)}>−</button>
                <span>{item.cartQuantity}</span>
                <button aria-label={`Increase ${item.name} quantity`} onClick={() => onChangeQuantity(item.id, 1)} disabled={item.cartQuantity >= item.quantity}>+</button>
              </div>
              <strong className="line-total">{money(item.price * item.cartQuantity)}</strong>
            </article>
          ))}
        </section>
        <aside className="summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
          <div className="summary-row"><span>Subtotal</span><span>{money(total)}</span></div>
          <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
          <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="button checkout-button" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          <Link to="/" className="continue-link">Continue shopping</Link>
        </aside>
      </div>
    </main>
  )
}

function Checkout({ cart, clearCart }) {
  const [form, setForm] = useState({ name: '', email: '', address: '' })
  const [submitted, setSubmitted] = useState(false)
  const total = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0)

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    clearCart()
  }

  if (submitted) {
    return <main className="container"><div className="empty-state success"><div className="empty-icon">✅</div><h1>Order placed successfully!</h1><p>Thank you, {form.name}. This is a demo checkout for the practical assignment.</p><Link className="button" to="/">Return to store</Link></div></main>
  }

  if (cart.length === 0) {
    return <main className="container empty-state"><h2>No items to checkout</h2><Link className="button" to="/">Browse Products</Link></main>
  }

  return (
    <main className="container checkout-container">
      <Link to="/cart" className="back-link">← Back to cart</Link>
      <section className="checkout-card">
        <div><p className="eyebrow">ALMOST THERE</p><h1>Checkout</h1><p className="muted">Enter your details to complete this demo order.</p></div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>
          <label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>
          <label>Delivery address<textarea required rows="3" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Enter your address" /></label>
          <div className="summary-total"><span>Order total</span><strong>{money(total)}</strong></div>
          <button className="button checkout-button" type="submit">Place Demo Order</button>
        </form>
      </section>
    </main>
  )
}

export default function App() {
  const [cart, setCart] = useState([])

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id)
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return currentCart
        return currentCart.map((item) => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item)
      }
      if (product.quantity < 1) return currentCart
      return [...currentCart, { ...product, cartQuantity: 1 }]
    })
  }

  function changeQuantity(id, change) {
    setCart((currentCart) => currentCart.map((item) => {
      if (item.id !== id) return item
      return { ...item, cartQuantity: Math.max(1, Math.min(item.quantity, item.cartQuantity + change)) }
    }))
  }

  function removeFromCart(id) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id))
  }

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.cartQuantity, 0), [cart])
  const clearCart = () => setCart([])

  return (
    <>
      <Header cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<ProductList onAdd={addToCart} />} />
        <Route path="/products/:id" element={<ProductDetails onAdd={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} onChangeQuantity={changeQuantity} onRemove={removeFromCart} />} />
        <Route path="/checkout" element={<Checkout cart={cart} clearCart={clearCart} />} />
        <Route path="*" element={<main className="container empty-state"><h1>Page not found</h1><Link className="button" to="/">Go home</Link></main>} />
      </Routes>
      <footer className="footer">Product Store · React Practical Assignment · GSFC University</footer>
    </>
  )
}