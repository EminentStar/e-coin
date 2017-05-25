import requests
from bs4 import BeautifulSoup

SHOPPING_URL='http://shopping.naver.com/search/all.nhn?query='

def scrap_searched_page(query, base_url=SHOPPING_URL): 
    """This function scraps product data and returns a product list."""
    url = base_url + query 
    source_code = requests.get(url)
    plain_text = source_code.text
    soup = BeautifulSoup(plain_text, 'lxml')
    product_tags = soup.findAll('li', {'class': '_product_list'})
    
    products = []

    for p in product_tags:
        title = p.find('a', {'class': 'tit'})
        price = p.find('span', {'class':'num _price_reload'})
        img = p.find('img', {'class': '_productLazyImg'})

        title = title.text.strip()
        price = int(price.text.strip().replace(',',''))
        img = img.get('data-original')
        products.append({'title': title, 'price': price, 'img':img})
    
    return products
print(scrap_searched_page('김밥'))
