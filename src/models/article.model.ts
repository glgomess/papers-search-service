export default class Article {
  category:string;

  doi:string;

  address:string;

  authors:string;

  booktitle:string;

  pages:string;

  publisher:string;

  series:string;

  title:string;

  year:string;

  isbn:string;

  abstract:string;

  numpages:string;

  keywords:string;

  location:string;

  pagefirst:string;

  pagelast:string;

  constructor(
    elasticResult: { category:string, doi:string, address:string,
     authors:string, booktitle:string, pages:string,
     publisher:string, series:string, title:string,
     year:string, isbn:string, abstract:string,
     numpages:string, keywords:string, location:string,
     pagefirst:string, pagelast:string, },
  ) {
    this.category = elasticResult.category;
    this.doi = elasticResult.doi;
    this.address = elasticResult.address;
    this.authors = elasticResult.authors;
    this.booktitle = elasticResult.booktitle;
    this.pages = elasticResult.pages;
    this.publisher = elasticResult.publisher;
    this.series = elasticResult.series;
    this.title = elasticResult.title;
    this.year = elasticResult.year;
    this.isbn = elasticResult.isbn;
    this.abstract = elasticResult.abstract;
    this.numpages = elasticResult.numpages;
    this.keywords = elasticResult.keywords;
    this.location = elasticResult.location;
    this.pagefirst = elasticResult.pagefirst;
    this.pagelast = elasticResult.pagelast;
  }
}
