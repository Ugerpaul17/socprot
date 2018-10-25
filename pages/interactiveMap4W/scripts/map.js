$(window).on('load', function() {
	var documentSettings = {};
	var markerColors = [];

	var polygonSettings = [];
	var polygonSheets = 1;
	var polygonsLegend;

	var completePoints = false;
	var completePolygons = false;
	var completePolylines = false;

	/**
	   * Returns an Awesome marker with specified parameters
	   */
	function createMarkerIcon(icon, prefix, markerColor, iconColor) {
		return L.AwesomeMarkers.icon({
			icon: icon,
			prefix: prefix,
			markerColor: markerColor,
			iconColor: iconColor
		});
	}


	/**
	   * Sets the map view so that all markers are visible, or
	   * to specified (lat, lon) and zoom if all three are specified
	   */
	function centerAndZoomMap(points) {
		var lat = map.getCenter().lat, latSet = false;
		var lon = map.getCenter().lng, lonSet = false;
		var zoom = 12, zoomSet = false;
		var center;

		if (getSetting('_initLat') !== '') {
			lat = getSetting('_initLat');
			latSet = true;
		}

		if (getSetting('_initLon') !== '') {
			lon = getSetting('_initLon');
			lonSet = true;
		}

		if (getSetting('_initZoom') !== '') {
			zoom = parseInt(getSetting('_initZoom'));
			zoomSet = true;
		}

		if ((latSet && lonSet) || !points) {
			center = L.latLng(lat, lon);
		} else {
			center = points.getBounds().getCenter();
		}

		if (!zoomSet && points) {
			zoom = map.getBoundsZoom(points.getBounds());
		}

		map.setView(center, zoom);
	}


	/**
	   * Given a collection of points, determines the layers based on 'Group'
	   * column in the spreadsheet.
	   */
	function determineLayers(points) {
		;
		(function (d3, $, queue, window) {
			'use strict';
			// https://www.humanitarianresponse.info/en/operations/afghanistan/cvwg-3w
			// https://public.tableau.com/profile/geo.gecko#!/vizhome/Districtpolygon/v1?publish=yes
			'use strict';
			String.prototype.replaceAll = function (search, replacement) {
				var target = this;
				return target.replace(new RegExp(search, 'g'), replacement);
			};
			String.prototype.capitalize = function () {
				return this.charAt(0).toUpperCase() + this.slice(1);
			}
			// function capitalizeFirstLetter(string) {
			//   return string.charAt(0).toUpperCase() + string.slice(1);
			// }
			var _selectedDataset;
			var dataset;
			queue()
			// .defer(d3.json, "./UgandaDistricts.geojson")//DNAME_06
				.defer(d3.json, "./data/points__export.geojson")
				.defer(d3.csv, "./data/mapValues.csv")
				.defer(d3.csv, "./data/mapValuesInfrastructure.csv")
				.await(ready);





			var global = {};
			global.selectedDistrict = []; // name
			global.selectedSector = []; // ID
			global.selectedAgency = []; // ID
			global.selectedUn = []; // Type UN
			global.selectedIp = []; // Type IP
			global.selectedOp = []; // Type OP
			global.selectedDonor = []; // Type Donor
			global.selectedActorType = []; // Type Actor
			global.selectedWater = []; // Type Water
			global.districtCount;
			global.parishCount;
			global.sectorCount;
			global.agencyCount;
			global.donorCount;
			global.actorTypeCount;
			global.beneficiaryCount;
			global.unCount;
			global.ipCount;
			global.opCount;
			global.currentEvent;
			// global.needRefreshDistrict;


			function refreshCounts() {
				d3.select("#district-count").text(global.districtCount);
				d3.select("#sector-count").text(global.sectorCount);
				d3.select("#agency-count").text(global.agencyCount);
				d3.select("#beneficiary-count").text(global.beneficiaryCount);
				d3.select("#agencyUN-count").text(global.unCount);
				d3.select("#agencyIP-count").text(global.ipCount);
				d3.select("#agencyOP-count").text(global.opCount);
				global.selectedDistrict = [];
				global.selectedSector = [];
				global.selectedAgency = [];
				global.selectedWater = [];
				global.beneficiaryCount = [];
				global.selectedUn = [];
				global.selectedIp = [];
				global.selectedOp = [];

				d3.select("#partner-list-count").text(0);
				d3.select("#sector-list-count").text(0);
				d3.select("#parish-list-count").text(0);
				d3.select("#donor-list-count").text(0);
				d3.select("#actor-type-list-count").text(0);
				d3.select("#partner-header-total").text(global.agencyCount);
				d3.select("#sector-header-total").text(global.sectorCount);
				d3.select("#parish-header-total").text(global.parishCount);
				d3.select("#donor-header-total").text(global.donorCount);
				d3.select("#actor-type-header-total").text(global.actorTypeCount);


				_selectedDataset = dataset;
			}

			function ready(error, ugandaGeoJson, sector, relationship) {
				//standard for if data is missing, the map shouldnt start.
				if (error) {
					throw error;
				};
				ugandaGeoJson.features.map(function (d) {
					//					d.properties.identifier = d.properties.dist;
				});


				$(".custom-list-header").click(function () {
					$(".custom-list-header").siblings(".custom-list").addClass('collapsed');
					$(this).siblings(".custom-list").toggleClass('collapsed');
					$(this).find("span").toggleClass('glyphicon-menu-down').toggleClass('glyphicon-menu-right');
				});

				// Collapses all the boxes apart from subCounty
				$(".custom-list-header").siblings(".custom-list").addClass('collapsed');
				$("#agency-list.custom-list").removeClass('collapsed');

				//need join all data
				var nameAbbKays = d3.keys(relationship[0]);
				var sectorKays = d3.keys(sector[0]);

				dataset = relationship.map(function (d) {
					var i;

					for (i = 0; i < sector.length; i++) {
						if (sector[i].typeTextSchools === d.typeTextSchools) {
							sectorKays.map(function (k) {
								d[k] = sector[i][k];
							});
							break;
						}
					}
					return d;
				});


				var datasetNest = d3.nest().key(function (d) {
					return d.PNAME2014;
				}).entries(dataset);



				function updateTable(data) {

					d3.select('#page-wrap').select('table').remove();
					var sortAscending = true;
					var table = d3.select('#page-wrap').append('table');
					var titles = d3.keys(data[0]);
					var titlesText = ["Parish Name", "Number of facilities"]
					var headers = table.append('thead').append('tr')
					.selectAll('th')
					.data(titlesText).enter()
					.append('th')
					.text(function (d) {
						return d
					})
					.on('click', function (d) {
						headers.attr('class', 'header');
						if (sortAscending) {
							rows.sort(function(a, b) { 
								return d3.descending(a.key, b.key)
							});
							sortAscending = false;
							this.className = 'aes';
						} else {
							rows.sort(function(a,b){
								return d3.ascending(a.key, b.key)
							});
						}

					});
					var rows = table.append('tbody').selectAll('tr')
					.data(data).enter()
					.append('tr');
					rows.selectAll('td')
						.data(function (d) {
						return titles.map(function (k) {
							if (k === 'values') {
								return { 'value': +(d[k].length), 'name': k};
							} else {
								return { 'value': d[k], 'name': k};
							}

						});
					}).enter()
						.append('td')
						.attr('data-th', function (d) {
						return d.name;
					})
						.text(function (d) {
						return d.value;
					}).on("click", function (d) {

						if (d.name === "key") {
							var parishDataFilter = districtList.filter(function (k) {
								if (d.value === k.key) {
									var str = "<thead><tr><th style='border: 1px solid #ccc!important;text-decoration: none !important; text-align: left;'>Agency Name</th> <th style='text-decoration: none !important; border: 1px solid #ccc!important; text-align: left;'>Project Title</th><th style='text-decoration: none !important; border: 1px solid #ccc!important; text-align: left;'>Project Start</th><th style='text-decoration: none !important; border: 1px solid #ccc!important; text-align: left;'>Project End</th></tr></thead>";

									var tooltipList = "";
									var i = 0;
									while (i < k.values.length) {
										tooltipList = tooltipList + ("<tr><td style='border: 1px solid #ccc!important;text-decoration: none !important; text-align: left;'>" + k.values[i]["Agency name"] + "</td> <td style='border: 1px solid #ccc!important; text-decoration: none !important; text-align: left;'>" + k.values[i]["Detailed Activity description"] + "</td><td style='border: 1px solid #ccc!important; text-decoration: none !important; text-align: left;'>" + k.values[i]["Start (month)"] + "</td><td style='border: 1px solid #ccc!important; text-decoration: none !important; width: 2em!important; text-align: left;'>" + k.values[i]["End (month)"] + "</td></tr>");
										i++
									}					
								}
							})
							}	
					})
						.on("mouseover", function (d){
						if(d.name === "key") {
							d3.select(this).style("cursor", "pointer");
						}
					});
				}

				var top5Values = datasetNest.sort(function(a,b){
					return d3.ascending(a.key, b.key)
				});
				updateTable(top5Values);



				var districtList = d3.nest().key(function (d) {
					return d.layer;
				}).sortKeys(d3.ascending).entries(relationship);

				var sectorList = d3.nest().key(function (d) {
					return d.typeTextSchools;
				}).sortKeys(d3.ascending).entries(relationship);

				var agencyList = d3.nest().key(function (d) {
					return d.typeTextProtection;
				}).sortKeys(d3.ascending).entries(relationship);

				var waterList = d3.nest().key(function (d) {
					return d.typeTextWater;
				}).sortKeys(d3.ascending).entries(relationship);


				var donorList = d3.nest().key(function (d) {
					return d.ownershipText;
				}).sortKeys(d3.ascending).entries(relationship);

				var actorTypeList = d3.nest().key(function (d) {
					return d.typeTextHealth;
				}).sortKeys(d3.ascending).entries(relationship);

				var beneficiaries = d3.sum(relationship, function(d){return parseFloat(d.Beneficiaries)});

				

				global.districtCount = districtList.length;
				global.parishCount = ugandaGeoJson.features.length;
				global.sectorCount = sectorList.length;
				global.agencyCount = agencyList.length;
				global.donorCount = donorList.length;
				global.actorTypeCount = actorTypeList.length;
				global.beneficiaryCount = beneficiaries;


				refreshCounts();
				updateLeftPanel(districtList, sectorList, agencyList, donorList, actorTypeList, waterList, dataset);



				var h = (window.innerHeight ||
						 document.documentElement.clientHeight ||
						 document.body.clientHeight);
				if (h > 540) {
					d3.select(".list-container").style("height", h + "px");
					d3.select("#d3-map-wrapper").style("height", h + "px");
				}
				var w = (window.innerWidth ||
						 document.documentElement.clientWidth ||
						 document.body.clientWidth);
				d3.select(".list-container").style("height", h - 0 + "px")

				L.control.zoom({
					position:'topright'
				}).addTo(map);

				var sidebar = L.control.sidebar('sidebar-left').addTo(map);

				sidebar.open("home");

//				var sidebar1 = L.control.sidebar('sidebar-right', {position: "right"}).addTo(map);

				//				map.bounds = [],
				//					map.setMaxBounds([
				//					[4.5,29.5],
				//					[-1.5,34.5]
				//				]);
				map.options.maxZoom=22;
				map.options.minZoom=12;
				
				
				var points = L.geoJson(ugandaGeoJson, {
				pointToLayer: function (feature, latlng) {
					function colour(feature) {
						if (feature.properties.layer === "Police") {
							return	"#00008b"
						} else if (feature.properties.layer === "Water") {
							return	"#1e90ff"
						} else if (feature.properties.layer === "Schools") {
							return	"#008000"
						} else if (feature.properties.layer === "Kampala Health Facilities") {
							return	"#8b0000"
						}
					}
					var geojsonMarkerOptions = {
						radius: 5,
						fillColor: colour(feature),
						color: "#000",
						weight: 1,
						opacity: 1,
						fillOpacity: 0.8,
						className: "district district-" + feature.properties.identifier + " " + feature.properties.class
					};
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			}).bindPopup(function (layer) {
    return "<b>" + layer.feature.properties.Type + ".</b></br>" +
							"<b>Name: </b>" + layer.feature.properties.Name + "</br>" +
							"<b>Located in: </b>" + layer.feature.properties.PNAME2014 + " Parish</br>" +
							"<b>Ownership: </b>" + layer.feature.properties.ownershipText + "</br></br></br>"
}).addTo(map);
			

				var opacity = 0.3;
				var wrapper = d3.select("#d3-map-wrapper");
				var width = wrapper.node().offsetWidth || 960;
				var height = wrapper.node().offsetHeight || 480;
				var tooltip = d3.select(map.getPanes().overlayPane)
				.append("div")
				.attr("class", "d3-tooltip d3-hide");
				var datasetNest = d3.nest().key(function (d) {
					if(d.key !== "") {
						return d.layer;	
					}
				}).entries(dataset);


				
				function refreshMap() {
					refreshCounts();
					d3.selectAll(".district").style("opacity", 1);

					d3.select("#district-list").selectAll("p").style("background", "transparent");
					d3.select("#sector-list").selectAll("p").style("background", "transparent");
					d3.select("#actor-type-list").selectAll("p").style("background", "transparent");
					d3.select("#agency-list").selectAll("p").style("background", "transparent");
					d3.select("#donor-list").selectAll("p").style("background", "transparent");
					d3.select("#water-list").selectAll("p").style("background", "transparent");

					updateLeftPanel(districtList, sectorList, agencyList, donorList, actorTypeList, waterList, dataset);
					var domain = [+Infinity, -Infinity];


					var beneficiaries = d3.sum(relationship, function(d){return parseFloat(d.Beneficiaries)});

					global.beneficiaryCount = beneficiaries;

					d3.select("#beneficiary-count").text(beneficiaries);
				}
				d3.select("#d3-map-refresh").on("click", refreshMap);



				function onlyUniqueObject(data) {
					data = data.filter(function (d, index, self) {
						return self.findIndex(function (t) {
							return t.key === d.key;
						}) === index;
					});
					return data;
				}

				function filterSelectedItem(item, c, needRemove) {
					if (needRemove) {
						global[item] = global[item].filter(function (a) {
							return a !== c;
						});
					} else {
						global[item].push(c);
					}
					global[item] = onlyUniqueObject(global[item]); //global[item].filter(onlyUnique);;
				}




				function myFilter(c, flag, needRemove) {
					if (flag === "district") {
						filterSelectedItem("selectedDistrict", c, needRemove);
					}
					if (flag === "sector") {
						filterSelectedItem("selectedSector", c, needRemove);
					}
					if (flag === "agency") {
						filterSelectedItem("selectedAgency", c, needRemove);
					}
					if (flag === "unAgency") {
						filterSelectedItem("selectedUn", c, needRemove);
					}
					if (flag === "ipAgency") {
						filterSelectedItem("selectedIp", c, needRemove);
					}
					if (flag === "opAgency") {
						filterSelectedItem("selectedOp", c, needRemove);
					}
					if (flag === "donor") {
						filterSelectedItem("selectedDonor", c, needRemove);
					}
					if (flag === "actor-type") {
						filterSelectedItem("selectedActorType", c, needRemove);
					}
					if (flag === "water") {
						filterSelectedItem("selectedWater", c, needRemove);
					}

					var selectedDataset = dataset.filter(function (d) { //global.selectedDataset
						var isDistrict = false; //global.selectedDistrict ? global.selectedDistrict.key === d.District : true;
						if (global.selectedDistrict.length > 0) {
							global.selectedDistrict.map(function (c) {
								if (c.key === d.layer) {
									isDistrict = true;
								}
							});
						} else {
							isDistrict = true;
						}
						// var isSector = global.selectedSector ? global.selectedSector.values[0].Sector_ID === d.Sector_ID : true;
						var isSector = false;
						if (global.selectedSector.length > 0) {
							global.selectedSector.map(function (c) {
								if (c.values[0].typeTextSchools === d.typeTextSchools) {
									isSector = true;
								}
							});
						} else {
							isSector = true;
						}
						// var isAgency = global.selectedAgency ? global.selectedAgency.values[0].Actor_ID === d.Actor_ID : true;

						var isAgency = false;
						if (global.selectedAgency.length > 0) {
							global.selectedAgency.map(function (c) {
								if (c.values[0].typeTextProtection === d.typeTextProtection) {
									isAgency = true;
								}
							});
						} else {
							isAgency = true;
						}

						var isDonor = false;
						if (global.selectedDonor.length > 0) {
							global.selectedDonor.map(function (c) {
								if (c.values[0].ownershipText === d.ownershipText) {
									isDonor = true;
								}
							});
						} else {
							isDonor = true;
						}

						var isActorType = false;
						if (global.selectedActorType.length > 0) {
							global.selectedActorType.map(function (c) {
								if (c.values[0].typeTextHealth === d.typeTextHealth) {
									isActorType = true;
								}
							});
						} else {
							isActorType = true;
						}

						var isWater = false;
						if (global.selectedWater.length > 0) {
							global.selectedWater.map(function (c) {
								if (c.values[0].typeTextWater === d.typeTextWater) {
									isActorType = true;
								}
							});
						} else {
							isWater = true;
						}

						return isDistrict && isSector && isAgency && isDonor && isActorType && isWater;
					});

					_selectedDataset = selectedDataset;
					

					var selectedDatasetNest = d3.nest()
					.key(function(d){
						return d.layer; 
					}).entries(selectedDataset);

					beneficiaries = d3.sum(selectedDataset, function(d){return parseFloat(d.Beneficiaries)});

					d3.select("#beneficiary-count").text(beneficiaries);


					var districtList = null;
					if (flag !== "district") {
						districtList = d3.nest().key(function (d) {
							return d.layer;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}

					var waterList = null;
					if (flag !== "water") {
						waterList = d3.nest().key(function (d) {
							return d.typeTextWater;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}

					var sectorList = null;
					if (flag !== "sector") {
						sectorList = d3.nest().key(function (d) {
								return d.typeTextSchools;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}

					var agencyList = null;
					if (flag !== "agency") {
						agencyList = d3.nest().key(function (d) {
								return d.typeTextProtection;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}
					var donorList = null;
					if (flag !== "donor") {
						donorList = d3.nest().key(function (d) {
								return d.ownershipText;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}
					var actorTypeList = null;
					if (flag !== "actor-type") {
						actorTypeList = d3.nest().key(function (d) {
								return d.typeTextHealth;
						}).sortKeys(d3.ascending).entries(selectedDataset);
					}

					// global.selectedDistrict = districtList;
					updateLeftPanel(districtList, sectorList, agencyList, donorList, actorTypeList, waterList, dataset);
					
				
					if (flag === "district") {
						d3.select("#district-count").text(global.selectedDistrict.length);
						d3.select("#parish-list-count").text(global.selectedDistrict.length);
					} else {
						// global.selectedDistrict = districtList;
						d3.select("#district-count").text(districtList.length);
						d3.select("#parish-list-count").text(global.selectedDistrict.length);
						d3.select("#parish-header-total").text(districtList.length);
					}
					if (flag === "sector") {
						d3.select("#sector-count").text(global.selectedSector.length);
						d3.select("#sector-list-count").text(global.selectedSector.length);
					} else {
						d3.select("#sector-count").text(sectorList.length);
						d3.select("#sector-list-count").text(global.selectedSector.length);
						d3.select("#sector-header-total").text(sectorList.length);
						//				d3.select("#sector-list-count").text(sectorList.length);
					}
					if (flag === "agency") {
						d3.select("#agency-count").text(global.selectedAgency.length);
						d3.select("#partner-list-count").text(global.selectedAgency.length);
					} else {
						d3.select("#agency-count").text(agencyList.length);
						d3.select("#partner-header-total").text(agencyList.length);
						d3.select("#partner-list-count").text(global.selectedAgency.length);
					}
					if (flag === "donor") {
						d3.select("#donor-count").text(global.selectedDonor.length);
						d3.select("#donor-list-count").text(global.selectedDonor.length);
					} else {
						d3.select("#donor-count").text(donorList.length);
						d3.select("#donor-header-total").text(donorList.length);
						d3.select("#donor-list-count").text(global.selectedDonor.length);
					}
					if (flag === "actor-type") {
						d3.select("#actor-type-count").text(global.selectedActorType.length);
						d3.select("#actor-type-list-count").text(global.selectedActorType.length);
					} else {
						d3.select("#actor-type-count").text(actorTypeList.length);
						d3.select("#actor-type-header-total").text(actorTypeList.length);
						d3.select("#actor-type-list-count").text(global.selectedActorType.length);
					}



				}



				function updateLeftPanel(districtList, sectorList, agencyList, donorList, actorTypeList, waterList, dataset) {
					if (global.currentEvent !== "district") {
						districtList.map(function (a) {
							d3.select(".district-" + a.key.replaceAll('[ ]', "_")).style("opacity", 1);
							d3.select(".district-" + a.key.toLowerCase().replaceAll('[ ]', "-")).style("opacity", 1);
						});
					}

					if (districtList) {
						d3.select("#district-count").text(districtList.length);
						var _districtList = d3.select("#district-list").selectAll("p")
						.data(districtList);
						_districtList.enter().append("p")
							.text(function (d) {
							return d.layer;
						})
							.on("click", function (c) {
							d3.selectAll(".labels").style("opacity", opacity);
							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" : "#13988e");
							global.currentEvent = "district";
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);

							global.selectedDistrict.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedDistrict.length === 0){
								refreshMap();}
						});
						_districtList
							.attr("class", function (d) {
							return "district-list-" + d.key.replaceAll('[ ]', "_");
						})
							.text(function (d) {
							return d.key;
						});
						_districtList.exit().remove();
					}

					if (waterList) {
						d3.select("#water-count").text(waterList.length);
						var _waterList = d3.select("#water-list").selectAll("p")
						.data(waterList);
						_waterList.enter().append("p")	
							.text(function (d) {
							return d.typeTextWater;
						})
							.on("click", function (c) {
							d3.selectAll(".labels").style("opacity", opacity);
							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" : "#13988e");
							global.currentEvent = "water";
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);

							console.log(global.selectedWater);

							global.selectedWater.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedWater.length === 0){
								refreshMap();}
						});
						_waterList
							.attr("class", function (d) {
							return "district-list-" + d.key.replaceAll('[ ]', "_");
						})
							.text(function (d) {
							return d.key;
						});
						_waterList.exit().remove();
					}

					if (sectorList) {
						d3.select("#sector-count").text(sectorList.length);
						var _sectorList = d3.select("#sector-list").selectAll("p")
						.data(sectorList);
						_sectorList.enter().append("p")
							.attr("class", function(d){
							return d.key.replace(/\s/g,'');
						})
							.text(function (d) {
							//return d.key;
						})
						// .style("background", "transparent")
							.on("click", function (c) {
							// d3.select(this.parentNode).selectAll("p").style("background", "transparent");
							// d3.select(this).style("background", "#8cc4d3");
							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" :"#13988e");
							global.currentEvent = "sector";
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);
							// myFilterBySector(c, needRemove);
							global.selectedSector.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedSector.length === 0){
								refreshMap();}
						});
						_sectorList //.transition().duration(duration)
							.attr("class", function(d){
							return d.key.replace(/\s/g,'');
						})
							.text(function (d) {
							return d.key;
						});
						_sectorList.exit().remove();
					}

					if (agencyList) {
						d3.select("#agency-count").text(agencyList.length);
						var _agencyList = d3.select("#agency-list").selectAll("p")
						.data(agencyList);
						_agencyList.enter().append("p")
						// .style("background", "transparent")
							.on("click", function (c) {

							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" : "#13988e");
							// myFilterByAgency(c, needRemove);
							global.currentEvent = "agency"
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);

							global.selectedAgency.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedAgency.length === 0){
								refreshMap();}


						});
						_agencyList
							.html(function(d) {
							return "<a>" + d.key + "</a>"
						})
						_agencyList.exit().remove();
					}

					if (donorList) {
						d3.select("#donor-count").text(donorList.length);
						var _donorList = d3.select("#donor-list").selectAll("p")
						.data(donorList);
						_donorList.enter().append("p")
							.text(function (d) {
							return d.key;
						})
							.on("click", function (c) {
							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" :"#13988e");
							// myFilterByAgency(c, needRemove);
							global.currentEvent = "donor"
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);

							global.selectedDonor.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedDonor.length === 0){
								refreshMap();}
						});
						_donorList
							.text(function (d) {
							return d.key;
						});
						_donorList.exit().remove();
					}

					if (actorTypeList) {
						d3.select("#actor-type-count").text(actorTypeList.length);
						var _actorTypeList = d3.select("#actor-type-list").selectAll("p")
						.data(actorTypeList);
						_actorTypeList.enter().append("p")
							.text(function (d) {
							return d.key;
						})
						// .style("background", "transparent")
							.on("click", function (c) {
							var needRemove = $(d3.select(this).node()).hasClass("d3-active"); //d3.select(this).attr("class");//d3-active
							d3.select(this).classed("d3-active", !needRemove).style("background", needRemove ? "transparent" :"#13988e");
							// myFilterByAgency(c, needRemove);
							global.currentEvent = "actor-type"
							myFilter(c, global.currentEvent, needRemove);
							d3.selectAll(".district").style("opacity", 0);

							global.selectedActorType.map(function (a) {
								for (var i = 0;i < a.values.length; i++) {
									d3.selectAll(".district-" + a.values[i].identifier).style("opacity", 1);	
								}
							});
							if(global.selectedActorType.length === 0){
								refreshMap();}
						});
						_actorTypeList
							.text(function (d) {
							return d.key;
						});
						_actorTypeList.exit().remove();
					}

				}

				var datalayer;
				var datalayer1;

				$.getJSON('data/kampalaParishes.geojson', function(data){
					function style(feature) {
						return {
							color: '#00c5ff',
							fillOpacity: 0,
							opacity: 1,
							weight: 0.8
						};
					}



					function selectedStyle(feature) {
						return {
							color: '#ff5500',
							fillOpacity: 0,
							zIndex:10000,
							opacity: 1,
							weight: 2
						};
					}
					var selected;
					function parishOnEachFeature(feature, featureLayer){

						var popup = L.popup()
						.setContent("<b>" + feature.properties.s + " Division</b></br>" +
									"<b>Parish: </b>" + feature.properties.pname + "</br>");


						featureLayer.on({
							click: function(e) {
								datalayer.setStyle(style());
								selected = [];
								selected.push(e.target.feature.properties.pname);
								e.target.feature.properties.selected = true;
								e.target.setStyle(selectedStyle());
								e.target.bringToFront();
							}
						});

						featureLayer.bindPopup(popup);
					}
					datalayer = L.geoJson(data, {
						style: style,
						onEachFeature: parishOnEachFeature

					});

				});

				$.getJSON('data/kampala_slum_settlement.geojson', function(data){
					function style1(feature) {
						return {
							color: 'green',
							fillOpacity: 0.4,
							opacity: 1,
							weight: 0.8
						};
					}

					datalayer1 = L.geoJson(data, {
						style: style1
					});

				});

				var buttons1 = {
					Slums: L.easyButton({
						id: "slums",
						position: 'bottomleft',
						states: [{
							stateName: 'add-markers',
							icon: '<i class="mbri-map-pin mbr-iconfont mbr-iconfont-btn" style="opacity:0.2;"></i><span id="text" style="width = auto !important; opacity:0.2 ;" class="btn--text"><font color="black"><b>Slum Areas</b></font></span>',
							title: 'add random markers',
							onClick: function(control) {
								map.addLayer(datalayer1);
								control.state('remove-markers');
							}
						}, {
							icon: '<i class="mbri-map-pin mbr-iconfont mbr-iconfont-btn"></i><span id="text" style="width = auto !important;" class="btn--text"><font color="black"><b>Slum Areas</b></font></span>',
							stateName: 'remove-markers',
							onClick: function(control) {
								map.removeLayer(datalayer1);
								control.state('add-markers');
							},
							title: 'remove markers'
						}]
					}),
					Parishes: L.easyButton({
						id: "parishes",
						position: 'bottomleft',
						states: [{
							stateName: 'add-markers',
							icon: '<i class="mbri-map-pin mbr-iconfont mbr-iconfont-btn" style="opacity:0.2;"></i><span id="text" style="width = auto !important; opacity:0.2 ;" class="btn--text"><font color="black"><b>Parish Boundaries</b></font></span>',
							title: 'add random markers',
							onClick: function(control) {
								map.addLayer(datalayer);
								control.state('remove-markers');
							}
						}, {
							icon: '<i class="mbri-map-pin mbr-iconfont mbr-iconfont-btn"></i><span id="text" style="width = auto !important;" class="btn--text"><font color="black"><b>Parish Boundaries</b></font></span>',
							stateName: 'remove-markers',
							onClick: function(control) {
								map.removeLayer(datalayer);
								control.state('add-markers');
							},
							title: 'remove markers'
						}]
					})
				}

				// add the buttons. iterates over the buttons objects
				for (var key in buttons1) {
					if (buttons1.hasOwnProperty(key)) {
						buttons1[key].addTo(map);
						var htmlObject = buttons1[key].getContainer();
						var a = document.getElementById('buttonContainer1');
						function setParent(el, newParent){
							newParent.appendChild(el);
						}
						setParent(htmlObject, a);
					}
				}

				window.addEventListener("resize", function () {
					var wrapper = d3.select("#d3-map-wrapper");
					var width = wrapper.node().offsetWidth || 960;
					var height = wrapper.node().offsetHeight || 480;
					if (width) {
						d3.select("#d3-map-wrapper").select("svg")
							.attr("viewBox", "0 0 " + width + " " + height)
							.attr("width", width)
							.attr("height", height);
					}
				});
			} // ready



		})(d3, $, queue, window);


		document.getElementById('sidebar-left').style.display = "block";
//		document.getElementById('sidebar-right').style.display = "block";
		$('#map').css('visibility', 'visible');
		$('.loader').hide();

	}



	/**
	   * Here all data processing from the spreadsheet happens
	   */
	function onMapDataLoad() {
		var options = mapData.sheets(constants.optionsSheetName).elements;
		createDocumentSettings(options);

		document.title = getSetting('_mapTitle');
		addBaseMap();

		// Add point markers to the map
		var points = mapData.sheets(constants.pointsSheetName);
		var layers;
		var group = '';
		if (points && points.elements.length > 0) {
			layers = determineLayers(points.elements);
		} else {
			completePoints = true;
		}

		centerAndZoomMap(group);


		// Change Map attribution to include author's info + urls
		changeAttribution();


	}

	/**
	   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
	   */
	function changeAttribution() {
		var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
		var credit = 'View <a href="' + googleDocURL + '" target="_blank">data</a>';
		var name = getSetting('_authorName');
		var url = getSetting('_authorURL');

		if (name && url) {
			if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
			credit += ' by <a href="' + url + '">' + name + '</a> | ';
		} else if (name) {
			credit += ' by ' + name + ' | ';
		} else {
			credit += ' | ';
		}

		credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a>';
		if (getSetting('_codeCredit')) credit += ' by ' + getSetting('_codeCredit');
		credit += ' with ';
		$('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
	}


	/**
	   * Loads the basemap and adds it to the map
	   */
	function addBaseMap() {
		var basemap = trySetting('_tileProvider', 'CartoDB.Positron');
		L.tileLayer.provider(basemap, {
			maxZoom: 22
		}).addTo(map);
		L.control.attribution({
			position: trySetting('_mapAttribution', 'bottomright')
		}).addTo(map);
	}

	/**
	   * Returns the value of a setting s
	   * getSetting(s) is equivalent to documentSettings[constants.s]
	   */
	function getSetting(s) {
		return documentSettings[constants[s]];
	}

	/**
	   * Returns the value of setting named s from constants.js
	   * or def if setting is either not set or does not exist
	   * Both arguments are strings
	   * e.g. trySetting('_authorName', 'No Author')
	   */
	function trySetting(s, def) {
		s = getSetting(s);
		if (!s || s.trim() === '') { return def; }
		return s;
	}

	function tryPolygonSetting(p, s, def) {
		s = getPolygonSetting(p, s);
		if (!s || s.trim() === '') { return def; }
		return s;
	}

	/**
	   * Triggers the load of the spreadsheet and map creation
	   */
	var mapData;

	$.ajax({
		url:'csv/Options.csv',
		type:'HEAD',
		error: function() {
			// Options.csv does not exist, so use Tabletop to fetch data from
			// the Google sheet
			mapData = Tabletop.init({
				key: googleDocURL,
				callback: function(data, mapData) { onMapDataLoad(); }
			});
		},
		success: function() {
			// Get all data from .csv files
			mapData = Procsv;
			mapData.load({
				self: mapData,
				tabs: ['Options', 'Points', 'Polygons', 'Polylines'],
				callback: onMapDataLoad
			});
		}
	});

	/**
	   * Reformulates documentSettings as a dictionary, e.g.
	   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
	   */
	function createDocumentSettings(settings) {
		for (var i in settings) {
			var setting = settings[i];
			documentSettings[setting.Setting] = setting.Customize;
		}
	}

	// Returns a string that contains digits of val split by comma evey 3 positions
	// Example: 12345678 -> "12,345,678"
	function comma(val) {
		while (/(\d+)(\d{3})/.test(val.toString())) {
			val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
		}
		return val;
	}

});
