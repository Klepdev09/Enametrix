import styles from './PricingCtaBlock.module.css';

interface PricingCtaBlockProps {
  onStartEstimate?: () => void;
  onContact?: () => void;
  estimateFormUrl?: string;
  contactUrl?: string;
}

export default function PricingCtaBlock({
  onStartEstimate,
  onContact,
  estimateFormUrl = '#estimate-form',
  contactUrl = '#contact',
}: PricingCtaBlockProps) {
  const handleStartEstimate = () => {
    if (onStartEstimate) {
      onStartEstimate();
    } else if (estimateFormUrl) {
      window.location.href = estimateFormUrl;
    }
  };

  const handleContact = () => {
    if (onContact) {
      onContact();
    } else if (contactUrl) {
      window.location.href = contactUrl;
    }
  };

  return (
    <div className={styles.ctaBlock}>
      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>Get a clear estimate for your practice</h2>
        <p className={styles.ctaBody}>
          Every dental practice is different. To give you an accurate price for a complex solution — like a website + HIPAA forms + SEO — we use a short guided form. This form is absolutely free and takes about 2 minutes.
        </p>
        <div className={styles.trustBullets}>
          <span>100% free</span>
          <span>·</span>
          <span>No obligation</span>
          <span>·</span>
          <span>Dental-focused</span>
        </div>
        <div className={styles.ctaActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStartEstimate}>
            Start free estimate
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleContact}>
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
}

