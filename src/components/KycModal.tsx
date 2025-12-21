import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import './KycModal.css';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function KycModal({ isOpen, onClose, onComplete }: KycModalProps) {
  const { completeKyc } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: '',
    registrationNumber: '',
    businessType: '',
    address: '',
    phone: '',
    taxId: '',
    ownerName: '',
    ownerEmail: '',
    ownerId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }
    if (!formData.businessType.trim()) {
      newErrors.businessType = 'Business type is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Owner email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
      newErrors.ownerEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit KYC (in production, this would send to backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark as pending (admin will approve)
      await completeKyc();
      
      setIsSubmitting(false);
      onComplete();
    } catch (error) {
      console.error('KYC submission error:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="kyc-modal-overlay" onClick={onClose}>
      <div className="kyc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="kyc-modal-header">
          <h2>Complete Business KYC</h2>
          <p className="kyc-subtitle">
            Verify your business to start offering and requesting services on Centi Flow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="form-section">
            <h3>Business Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={e => handleChange('businessName', e.target.value)}
                  placeholder="Your registered business name"
                  className={errors.businessName ? 'error' : ''}
                />
                {errors.businessName && (
                  <span className="error-message">{errors.businessName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={e => handleChange('registrationNumber', e.target.value)}
                  placeholder="CAC/RC Number"
                  className={errors.registrationNumber ? 'error' : ''}
                />
                {errors.registrationNumber && (
                  <span className="error-message">{errors.registrationNumber}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Business Type *</label>
                <select
                  value={formData.businessType}
                  onChange={e => handleChange('businessType', e.target.value)}
                  className={errors.businessType ? 'error' : ''}
                >
                  <option value="">Select business type</option>
                  <option value="sole-proprietorship">Sole Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="limited-liability">Limited Liability Company</option>
                  <option value="corporation">Corporation</option>
                  <option value="non-profit">Non-Profit Organization</option>
                </select>
                {errors.businessType && (
                  <span className="error-message">{errors.businessType}</span>
                )}
              </div>

              <div className="form-group">
                <label>Tax ID / TIN</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={e => handleChange('taxId', e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Business Address *</label>
              <textarea
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Full business address"
                rows={3}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && (
                <span className="error-message">{errors.address}</span>
              )}
            </div>

            <div className="form-group">
              <label>Business Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+234 XXX XXX XXXX"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Owner/Authorized Representative</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={e => handleChange('ownerName', e.target.value)}
                  placeholder="Owner or authorized representative"
                  className={errors.ownerName ? 'error' : ''}
                />
                {errors.ownerName && (
                  <span className="error-message">{errors.ownerName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={e => handleChange('ownerEmail', e.target.value)}
                  placeholder="owner@business.com"
                  className={errors.ownerEmail ? 'error' : ''}
                />
                {errors.ownerEmail && (
                  <span className="error-message">{errors.ownerEmail}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>ID Number (National ID, Passport, etc.)</label>
              <input
                type="text"
                value={formData.ownerId}
                onChange={e => handleChange('ownerId', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="kyc-info-box">
            <p>
              <strong>Note:</strong> Your KYC information will be reviewed by our admin team. 
              You'll be notified once your business is verified. This process typically takes 1-2 business days.
            </p>
          </div>

          <div className="kyc-modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit KYC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

