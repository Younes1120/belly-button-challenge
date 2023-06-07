// Load the URL into a variable
let url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Promise Pending
let dataPromise = d3.json(url);
console.log("Data Promise: ", dataPromise);

// Initialize the dashboard when the data is loaded
dataPromise.then(data => {
    // Select the dropdown menu for sample selection
    let selector = d3.select("#selDataset");

    // Get all the sample names from the data
    let sampleNames = data.names;

    // Add the sample names to the dropdown menu options
    sampleNames.forEach(sample => {
        selector
            .append("option")
            .text(sample)
            .property("value", sample);
    });

    // Set the first sample name as the initial sample displayed on the dashboard
    let initialSample = sampleNames[0];

    // Show information and charts for the initial sample
    buildMetadata(initialSample, data);
    buildCharts(initialSample, data);
});

// This function runs when the user selects a new sample from the dropdown menu
function optionChanged(newSample) {
    // Update the information and charts for the new sample
    dataPromise.then(data => {
        buildMetadata(newSample, data);
        buildCharts(newSample, data);
    });
}

// This function shows the demographic information for the selected sample
function buildMetadata(sample, data) {
    // Get the metadata for all samples
    let metadata = data.metadata;

    // Filter the metadata to only include the selected sample
    let metadataArray = metadata.filter(sampleObj => sampleObj.id == sample);
    let selectedSample = metadataArray[0];
    let PANEL = d3.select("#sample-metadata");

    // Clear the previous demographic information
    PANEL.html("");

    // Show the demographic information for the selected sample
    Object.entries(selectedSample).forEach(([key, value]) => {
        PANEL.append("h6").text(`${key}: ${value}`);
    });
}

// This function shows the charts for the selected sample
function buildCharts(sample, data) {
    // Get all the sample data
    let samples = data.samples;

    // Filter the sample data to only include the selected sample
    let sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    // Filter the metadata data to only include the selected sample
    let metadataArray = data.metadata.filter(sampleObj => sampleObj.id == sample);
    let selectedSample = sampleArray[0];

    // Get the data for the selected sample
    let otu_ids = selectedSample.otu_ids;
    let otu_labels = selectedSample.otu_labels;
    let sample_values = selectedSample.sample_values;
    let wfreq = metadataArray[0].wfreq;

    // Code for Bar Chart
    // Create y labels and use the slice function to only get the top 10
    let yticks = otu_ids.slice(0, 10).map(outId => `OTU ${outId}`).reverse();

    // Reverse the x axis to ensure the bar chart has biggest on top down
    let barData = [{
        x: sample_values.slice(0, 10).reverse(),
        y: yticks,
        type: "bar",
        orientation: "h",
        text: otu_labels.slice(0, 10),
    }];

    // Create the bar chart
    Plotly.newPlot("bar", barData);

    // Code for Gauge Chart
    // Trig to calc meter point
    let degrees = 180 - (wfreq * 20);
    let radius = 0.5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX, space, pathY, pathEnd);

    let gaugeData = [{
        type: 'scatter',
        x: [0],
        y: [0],
        marker: { size: 12, color: '850000' },
        showlegend: false,
        name: 'Freq',
        text: wfreq,
        hoverinfo: 'text+name'
    },
    {
        values: [50 / 5, 50 / 5, 50 / 5, 50 / 5, 50 / 5, 50],
        rotation: 90,
        text: ['Very High', 'High', 'Medium', 'Low', 'Very Low', ''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
            colors: ['rgba(14, 127, 0, .5)',
                'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)',
                'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)',
                'rgba(255, 255, 255, 0)'
            ]
        },
        labels: ['8-9', '6-7', '4-5', '2-3', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    let gaugeLayout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week',
        xaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        yaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        }
    };

    // Create the gauge chart
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);

    // Code for Bubble Chart
    let bubbleData = [{
        x: otu_ids,
        y: sample_values,
        text: otu_labels,
        mode: 'markers',
        marker: {
            size: sample_values,
            color: otu_ids,
            colorscale: 'Earth'
        }
    }];

    let bubbleLayout = {
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Sample Values" }
    };

    // Create the bubble chart
    Plotly.newPlot('bubble', bubbleData, bubbleLayout);
}

          