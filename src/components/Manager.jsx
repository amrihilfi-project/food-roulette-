import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Manager({ restaurants, session, onSignIn, onSignOut }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [currentTags, setCurrentTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [currentRating, setCurrentRating] = useState(0);

  const [itemToDelete, setItemToDelete] = useState(null);

  const filtered = (restaurants || []).filter(r => {
    if (!searchTerm) return true;
    const filterText = searchTerm.toLowerCase().trim();
    return (
      r.name.toLowerCase().includes(filterText) ||
      r.location.toLowerCase().includes(filterText) ||
      (r.tags && r.tags.some(t => t.toLowerCase().includes(filterText)))
    );
  });

  const openAddModal = () => {
    setFormId('');
    setFormName('');
    setFormLocation('');
    setCurrentTags([]);
    setCurrentRating(0);
    setIsModalOpen(true);
  };

  const openEditModal = (resto) => {
    setFormId(resto.id);
    setFormName(resto.name);
    setFormLocation(resto.location);
    setCurrentTags([...(resto.tags || [])]);
    setCurrentRating(resto.rating || 0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!session) return; // Must be logged in

    const payload = {
      name: formName.trim(),
      location: formLocation.trim(),
      tags: currentTags,
      rating: currentRating,
      user_id: session.user.id
    };

    if (formId) {
      // Update
      const { error } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('id', formId);
      if (error) console.error('Error updating:', error);
    } else {
      // Insert
      const { error } = await supabase
        .from('restaurants')
        .insert([payload]);
      if (error) console.error('Error inserting:', error);
    }
    
    closeModal();
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !currentTags.includes(val)) {
        setCurrentTags([...currentTags, val]);
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (idxToRemove) => {
    setCurrentTags(currentTags.filter((_, idx) => idx !== idxToRemove));
  };

  const openConfirmDelete = (id) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete && session) {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', itemToDelete);
      if (error) console.error('Error deleting:', error);
    }
    closeConfirm();
  };

  const renderStars = (rating) => {
    const html = [];
    for (let i = 1; i <= 5; i++) {
        html.push(
            <span key={i} className={`resto-card__star ${i <= rating ? 'resto-card__star--filled' : ''}`}>
               ★
            </span>
        );
    }
    return html;
  };

  return (
    <>
      {/* Login bar if unauthenticated */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--clr-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Manager Access</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
            {session ? `Logged in as ${session.user.email}` : 'Log in with GitHub to add or edit restaurants.'}
          </p>
        </div>
        {!session ? (
            <button className="add-btn" onClick={onSignIn} style={{ background: '#333' }}>
              <span>🔑</span> Login with GitHub
            </button>
        ) : (
            <button className="btn btn--ghost" onClick={onSignOut} style={{color: 'var(--clr-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none'}}>
              Sign Out
            </button>
        )}
      </div>

      <div className="manager-toolbar" id="manager-toolbar">
        <div className="search-box">
          <span className="search-box__icon" aria-hidden="true">🔍</span>
          <input
            className="search-box__input"
            type="text"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {session && (
          <button className="add-btn" type="button" onClick={openAddModal}>
            <span>＋</span> Add Restaurant
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🍽️</span>
          <p className="empty-state__text">No restaurants found.<br />{session ? 'Add your first one!' : 'Check back later.'}</p>
        </div>
      ) : (
        <div className="resto-list">
          {filtered.map(resto => (
            <div key={resto.id} className="resto-card">
              <div className="resto-card__header">
                <div className="resto-card__info">
                  <h3 className="resto-card__name">{resto.name}</h3>
                  <p className="resto-card__location">
                    <span className="resto-card__location-icon" aria-hidden="true">📍</span> {resto.location}
                  </p>
                </div>
                {session && (
                  <div className="resto-card__actions">
                    <button className="resto-card__btn resto-card__btn--edit" aria-label="Edit" onClick={() => openEditModal(resto)}>✏️</button>
                    <button className="resto-card__btn resto-card__btn--delete" aria-label="Delete" onClick={() => openConfirmDelete(resto.id)}>🗑️</button>
                  </div>
                )}
              </div>
              <ul className="resto-card__tags">
                {(resto.tags || []).map((t, i) => (
                  <li key={i} className="resto-card__tag">{t}</li>
                ))}
              </ul>
              <div className="resto-card__rating">
                {renderStars(resto.rating || 0)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {!isModalOpen ? null : (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-labelledby="modal-title">
            <div className="modal__header">
              <h2 className="modal__title" id="modal-title">{formId ? 'Edit Restaurant' : 'Add Restaurant'}</h2>
              <button className="modal__close" type="button" aria-label="Close" onClick={closeModal}>&times;</button>
            </div>
            <form className="modal__form" onSubmit={handleFormSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label" htmlFor="form-name">Restaurant Name</label>
                <input
                  className="form-input"
                  id="form-name"
                  type="text"
                  placeholder="e.g. Ayam Bakar Si Bungsu"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="form-location">Location</label>
                <input
                  className="form-input"
                  id="form-location"
                  type="text"
                  placeholder="e.g. Jl. Gelap Nyawang, Bandung"
                  required
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags</label>
                <div className="tag-input" id="tag-input">
                  <div className="tag-input__pills">
                    {currentTags.map((tag, idx) => (
                      <div key={idx} className="tag-pill">
                        {tag}
                        <button type="button" className="tag-pill__remove" onClick={() => handleTagRemove(idx)} aria-label="Remove tag">&times;</button>
                      </div>
                    ))}
                  </div>
                  <input
                    className="tag-input__field"
                    type="text"
                    placeholder="Type a tag & press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      className={`star-rating__star ${val <= currentRating ? 'star-rating__star--active' : ''}`}
                      type="button"
                      onClick={() => setCurrentRating(val)}
                      aria-label={`${val} star`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal__actions">
                <button className="btn btn--ghost" type="button" onClick={closeModal} style={{color: 'var(--clr-text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', outline: 'none', padding: '0.5rem 1rem'}}>Cancel</button>
                <button className="add-btn" type="submit">Save Restaurant</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {!isConfirmOpen ? null : (
        <div className="modal-overlay">
          <div className="confirm" role="alertdialog" aria-labelledby="confirm-title" style={{background: 'var(--clr-surface)', padding: '2rem', borderRadius: 'var(--radius-xl)', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center'}}>
            <span className="confirm__icon" style={{fontSize: '3rem'}}>⚠️</span>
            <h3 className="confirm__title" id="confirm-title">Delete Restaurant?</h3>
            <p className="confirm__text" style={{color: 'var(--clr-text-muted)'}}>Are you sure you want to remove this restaurant? This cannot be undone.</p>
            <div className="confirm__actions" style={{display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem'}}>
              <button className="btn btn--ghost" type="button" onClick={closeConfirm} style={{color: 'var(--clr-text)', border: '1px solid var(--clr-border)', background: 'transparent', cursor: 'pointer', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem'}}>Cancel</button>
              <button className="btn btn--danger" type="button" onClick={handleDeleteConfirm} style={{background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-full)', padding: '0.5rem 1.5rem'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
