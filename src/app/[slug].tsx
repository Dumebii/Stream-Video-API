import { GetStaticPaths, GetStaticProps } from 'next';
import { contentfulClient } from '../lib/contentful';
import { Product } from '../types/product';

type ProductPageProps = {
  product: Product;
};

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
      <img src={product.imageUrl} alt={product.name} className="w-full max-w-xl mb-4" />
      <p className="text-lg">{product.description}</p>

      {/* Placeholder: We'll add the "Talk to an Expert" button later */}
      <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Talk to a Product Expert
      </button>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const entries = await contentfulClient.getEntries({ content_type: 'product' });
  
    const paths = entries.items.map((item: any) => ({
      params: { slug: item.fields.slug },
    }));
  
    return {
      paths,
      fallback: false, // Return 404 for unknown slugs
    };
  };
  
  export const getStaticProps: GetStaticProps = async (context) => {
    const slug = context.params?.slug;
  
    const entries = await contentfulClient.getEntries({
      content_type: 'product',
      'fields.slug': slug,
    });
  
    const productEntry = entries.items[0];
  
    const product: Product = {
      name: productEntry.fields.name,
      slug: productEntry.fields.slug,
      description: productEntry.fields.description,
      imageUrl: 'https:' + productEntry.fields.image.fields.file.url,
    };
  
    return {
      props: { product },
    };
  };
  