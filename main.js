var eventBus = new Vue()

Vue.component('info-tabs', {
	props: {
		shipping: {
			type: String,
			required: true
		},
		details: {
			type: Array,
			required: true
		}
	},
	template: `
		<div>
			<div>
				<span
					v-for="(tab, index) in tabs"
					:class="{activeTab: selectedTab === tab}"
					:key="index"
					@click="selectedTab = tab"
				> {{ tab }} </span>
			</div>
			<div v-show="selectedTab === 'Shipping'">
				<p>Shipping: {{ shipping }}</p>
			</div>
			<div v-show="selectedTab === 'Product Information'">
				<ul>
					<li v-for="detail in details">
						{{ detail }}
					</li>
				</ul>
			</div>
		</div>
	`,
	data() {
		return {
			tabs: ['Shipping', 'Product Information'],
			selectedTab: 'Shipping'
		}
	}
})
Vue.component('product-tabs', {
	props: {
		reviews: {
			type: Array,
			required: true
		}
	},
	template: `
		<div>
			<div>
				<span 
					v-for="tab in tabs"
					:class="{activeTab: selectedTab === tab}"
					@click="selectedTab = tab"
				> {{ tab }} </span>
			</div>
			<div v-show="selectedTab === 'Reviews'">
				<p v-if="!reviews.length">There are no reviews yet.</p>
				<ul>
					<li v-for="review in reviews">
						<p>{{ review.name }}</p>
						<p>Rating: {{ review.rating }}</p>
						<p>{{ review.review }}</p>
						<p>Would recommend?: {{ review.recommend }}</p>
					</li>
				</ul>
			</div>
			<div v-show="selectedTab === 'Write a Review'">
				<product-review></product-review>
			</div>
		</div>
	`,
	data() {
		return {
			tabs: ["Reviews", "Write a Review"],
			selectedTab: "Reviews"
		}
	}

})

Vue.component('product-review', {
	template: `
		<form class="review-form" @submit.prevent="onSubmit">

			<b v-if="errors.length">Please correct the following error(s):</b>
			<ul>
				<li v-for="error in errors"> {{ error }}</li>
			</ul>	

			<p>
				<label for="name">Name:</label>
				<input id="name" v-model="name" placeholder="name">
			</p>

			<p>
				<label for="review">Review:</label>
				<textarea id="review" v-model="review" placeholder="review"></textarea>
			</p>

			<p>
				<label for="rating">Rating:</label>
				<select id="rating" v-model.number="rating">
					<option>5</option>
					<option>4</option>
					<option>3</option>
					<option>2</option>
					<option>1</option>
				</select>
			</p>

			<p>Would you recommend this product?</p>
			<label>Yes</label>
			<input type="radio" name="choice" v-model="recommend" value="Yes">
			<label>No</label>
			<input type="radio" name="choice" v-model="recommend" value="No">
			
			</p>

			<p>
				<input type="submit" value="Submit">
			</p>

		</form>
	`,
	data() {
		return {
			name: null,
			review: null,
			rating: null,
			recommend: null,
			errors: []
		}
	},
	methods: {
		onSubmit: function() {
			this.errors = []
			if (this.name && this.review && this.rating && this.recommend) {
				let productReview = {
					name: this.name,
					review: this.review,
					rating: this.rating,
					recommend: this.recommend
				}	
				eventBus.$emit('review-submitted', productReview)
				this.name = null,
				this.review = null,
				this.rating = null,
				this.recommend = null
			} else {
					if(!this.name) this.errors.push("Name required.")
					if(!this.review) this.errors.push("Review required.")
					if(!this.rating) this.errors.push("Rating required.")
					if(!this.recommend) this.errors.push("Recommendation required.")
			}	
		}
	}
})

Vue.component('product', {
	props: {
		premium: {
			type: Boolean,
			required: true,
			default: false
		}
	},
	template: `
		<div class="product">
			<div class="product-image">
				<img :src="image" :alt="altText"/>
			</div>

			<div class="product-info">
				<h1>{{ title }}</h1>
				<p>{{ description }}</p>
				<p v-if="inStock">In Stock</p>
				<p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
				<p>{{ sale }}</p>
				<info-tabs :shipping="shipping" :details="details"></info-tabs>

				<div class="color-box"
					v-for="(variant, index) in variants" 
					:key="variant.variantId"
					:style="{ backgroundColor: variant.variantColor }"
					@mouseover="updateProduct(index)"
					>
				</div>

				<div v-for="size in sizes">
					<p> {{ size }} </p>
				</div>

				<button 
					@click="addToCart"
					:disabled="!inStock"
					:class ="{ disabledButton: !inStock } "
					>Add to Cart</button>
				<button 
					@click="removeFromCart">Remove</button>

				<p>
					<a :href="link" target="_blank">More products like this</a>
				</p>
			</div>
			<product-tabs :reviews="reviews"></product-tabs>

		</div>
		`,
	data() { 
		return {
			product: "Socks",
			description: "A pair of warm, fuzzy socks",
			altText: "A pair of socks",
			link: "",
			onSale: true,
			details: ["80% cotton", "20% polyester", "One-size fits all"],
			variants: [
				{
					variantId: 1111,
					variantBrand: "Cletus",
					variantColor: "green",
					variantImage: "./assets/socks-green.jpeg",
					variantQuantity: 10
				},
				{
					variantId: 2222,
					variantBrand: "Pabidas",
					variantColor: "blue",
					variantImage: "./assets/socks-blue.jpeg",
					variantQuantity: 5
				}
			],
			selectedVariant: 0,
			sizes: ["Small", "Medium", "Large"],
			reviews: []
		}
	},
	methods: {
		updateProduct: function(index) {
			this.selectedVariant = index
		},
		addToCart: function() {
			this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
		},
		removeFromCart: function() {
			this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
		}
	},
	computed: {
		title() {
			return this.variants[this.selectedVariant].variantBrand + ' ' + this.product
		},
		image() {
			return this.variants[this.selectedVariant].variantImage
		},
		inStock() {
			return this.variants[this.selectedVariant].variantQuantity
		},
		sale() {
			if (this.onSale) {
				return this.title + ' ' + "are on sale!"
			}
		},
		shipping() {
			if (this.premium) {
				return "Free"
			} else {
				return 2.99
			}
		}
	},
	mounted() {
		eventBus.$on('review-submitted', productReview => {
			this.reviews.push(productReview)
		})
	}
})

var app = new Vue({
	el: '#app',
	data: {
		premium: true,
		cart: []
	},
	methods: {
		updateCart:  function(id) {
			this.cart.push(id)
		},
		removeFromCart: function(id) {
			let targetIndex = this.cart.indexOf(id)
			if (targetIndex >= 0) {
				console.log(targetIndex)
				this.cart.splice(this.cart.indexOf(id), 1)
			}
			
		}
	}
})