jQuery(function ($) {
    'use strict';

	jQuery(document).on('ready', function () {

		 // Header Sticky
		 window.addEventListener('scroll', event => {
			const height = 150;
			const { scrollTop } = event.target.scrollingElement;
			document.querySelector('#navbar').classList.toggle('is-sticky', scrollTop >= height);
		});


		// Offcanvas Responsive Menu
		const list = document.querySelectorAll('.offcanvas-body .menu-item');
		function accordion(e) {
			e.stopPropagation(); 
			if(this.classList.contains('active')){
				this.classList.remove('active');
			}
			else if(this.parentElement.parentElement.classList.contains('active')){
				this.classList.add('active');
			}
			else {
				for(let j=0; j < list.length; j++){
					list[j].classList.remove('active');
				}
				this.classList.add('active');
			}
		}
		for(let j = 0; j < list.length; j++ ){
			list[j].addEventListener('click', accordion);
		}
	
		window.onload = function(){

			// Back to Top
			const getId = document.getElementById("backtotop");
			if (getId) {
				const topbutton = document.getElementById("backtotop");
				topbutton.onclick = function (e) {
					window.scrollTo({ top: 0, behavior: "smooth" });
				};
				window.onscroll = function () {
					if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
						topbutton.style.opacity = "1";
					} else {
						topbutton.style.opacity = "0";
					}
				};
			}
	
			// Preloader
			const getPreloaderId = document.getElementById('preloader');
			if (getPreloaderId) {
				getPreloaderId.style.display = 'none';
			}
		};

		// Disable Preloader in Elementor Edit Mode
		if($('body').hasClass("elementor-editor-active")) {
			$('.preloader-area').removeClass("preloader-area");
		};

		// Footer Column
		$('.colfooter-default-column:nth-child(1)').addClass('col-lg-4 col-sm-6');
		$('.colfooter-default-column:nth-child(2)').addClass('col-lg-2 col-sm-6');
		$('.colfooter-default-column:nth-child(3)').addClass('col-lg-3 col-sm-6 ps-3');
		$('.colfooter-default-column:nth-child(4)').addClass('col-lg-3 col-sm-6');
		

		try {

			//Country Flag Selector
			var customDropdowns = document.querySelectorAll('.country-dropdown');
		
			customDropdowns.forEach(function(customDropdown) {
				var customSelected = customDropdown.querySelector('.custom-dropdown-selected');
				var customOptions = customDropdown.querySelector('.custom-dropdown-options');
		
				customSelected.addEventListener('click', function () {
				customOptions.style.display = customOptions.style.display === 'block' ? 'none' : 'block';
				});
		
				customOptions.addEventListener('click', function (event) {
				var option = event.target.closest('.custom-dropdown-option');
				if (option) {
					customSelected.innerHTML = option.innerHTML;
					customOptions.style.display = 'none';
				}
				});
			});
		
			// Light/Dark Mode
			// function to set a given theme/color-scheme
			function setTheme(themeName) {
				localStorage.setItem('manee_theme', themeName);
				document.documentElement.className = themeName;
			}
			// function to toggle between light and dark theme
			function toggleTheme() {
				if (localStorage.getItem('manee_theme') === 'theme-dark') {
					setTheme('theme-light');
				} else {
					setTheme('theme-dark');
				}
			}
			// Immediately invoked function to set the theme on initial load
			(function () {
				if (localStorage.getItem('manee_theme') === 'theme-dark') {
					setTheme('theme-dark');
					document.getElementById('slider').checked = false;
				} else {
					setTheme('theme-light');
				document.getElementById('slider').checked = true;
				}
			})();
		} catch (err) {}

	});

	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/widget', function( $scope ) {

			// Testimonial Slider
			var swiper = new Swiper(".testimonial-slider-one", {
				spaceBetween: 25,
				grabCursor: true,
				loop: false,
				slidesPerView: 1,
				speed:1400,
				navigation: {
					nextEl: ".testimonial-next",
					prevEl: ".testimonial-prev",
				},
				pagination: {
					el: ".testimonial-pagination",
					clickable: true,
					renderBullet: function (index, className) {
					  return '<span class="' + className + '"> 0' + (index + 1) + "</span>";
					},
				},
			});
			var swiper = new Swiper(".testimonial-slider-two", {
				spaceBetween: 25,
				grabCursor: true,
				loop: false,
				speed:1400,
				navigation: {
					nextEl: ".testimonial-next",
					prevEl: ".testimonial-prev",
				},
				pagination: {
					el: ".testimonial-pagination",
					clickable: true,
					renderBullet: function (index, className) {
					  return '<span class="' + className + '"> 0' + (index + 1) + "</span>";
					},
				},
				breakpoints: {
					0: {
					  slidesPerView: 1
					},
					768: {
					  slidesPerView: 1.2
					},
					992: {
						slidesPerView: 1.4
					},
					1200: {
					  slidesPerView: 1.5
					},
					1400: {
					  slidesPerView: 1.8,
					  spaceBetween: 35
					}
				}
			});
		
			//Partner Slider
			var swiper = new Swiper(".partner-slider", {
				spaceBetween: 25,
				grabCursor: true,
				loop: true,
				autoplay: {
					delay: 3000,
					disableOnInteraction: false
				},
				speed:1400,
				breakpoints: {
					0: {
					  slidesPerView: 2
					},
					768: {
					  slidesPerView: 3
					},
					992: {
						slidesPerView: 4
					},
					1200: {
					  slidesPerView: 5
					},
					1400: {
					  slidesPerView: 6
					}
				}
			});
		
			//Service Slider
			var swiper = new Swiper(".service-slider", {
				spaceBetween: 25,
				grabCursor: true,
				loop: true,
				speed:1400,
				autoplay: {
					delay: 5000,
					disableOnInteraction: false
				},
				breakpoints: {
					0: {
					  slidesPerView: 1
					},
					576: {
					  slidesPerView: 1.4
					},
					768: {
					  slidesPerView: 1.8
					},
					992: {
						slidesPerView: 2.2
					},
					1200: {
						slidesPerView: 2.2
					  },
					1300: {
					  slidesPerView: 2.6
					},
					1400: {
					  slidesPerView: 3.2,
					  spaceBetween: 35
					},
					1600: {
						slidesPerView: 3.5,
						spaceBetween: 35
					  }
				}
			});

			// AOS
			// AOS.init({
			// 	startEvent: 'load'
			// });
			

		});
	});
}(jQuery));