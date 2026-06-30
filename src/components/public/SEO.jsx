import { Helmet } from 'react-helmet-async';

function SEO({ title, description, keywords, ogImage, ogUrl }) {
  const defaultTitle = 'FinFiler | Modern Financial Compliance Services';
  const defaultDescription =
    'FinFiler simplifies GST registration, company incorporation, and tax filing. Expert financial compliance services tailored for Indian businesses and professionals.';
  const defaultKeywords =
    'GST Registration, Tax Filing, Compliance, Startups, Financial Services, India, ITR, Company Registration, Accounting';

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {ogUrl && <meta property="twitter:url" content={ogUrl} />}
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}

export default SEO;
