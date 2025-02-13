document.getElementById("upload").addEventListener("change", handleFileUpload);
document.getElementById("downloadBtn").addEventListener("click", downloadUpdatedFile);

let originalData = null;
let nalUnits = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        originalData = new Uint8Array(e.target.result);
        parseNALUnits(originalData);
    };
    reader.readAsArrayBuffer(file);
}

function parseNALUnits(data) {
    nalUnits = [];
    let i = 0;
    while (i < data.length - 4) {
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 1) {
            let nalStart = i + 4;
            let nalType = (data[nalStart] & 0x7E) >> 1; // HEVC NAL unit type
            let nalEnd = findNextStartCode(data, nalStart);
            nalUnits.push({ type: nalType, start: nalStart, end: nalEnd, raw: data.slice(nalStart, nalEnd) });
            i = nalEnd;
        } else {
            i++;
        }
    }
    displayNALInfo();
}

function findNextStartCode(data, start) {
    for (let i = start; i < data.length - 4; i++) {
        if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 1) {
            return i;
        }
    }
    return data.length;
}

function parseVPS(data) {
    return {
        vps_video_parameter_set_id: data[0] & 0x0F,
        vps_max_layers_minus1: (data[1] >> 4) & 0x1F,
        vps_max_sub_layers_minus1: (data[1] & 0x07),
        vps_temporal_id_nesting_flag: (data[1] >> 7) & 0x01,
        vps_max_layer_id: data[2] & 0x3F,
        vps_num_layer_sets_minus1: data[3] & 0xFF,
        vps_timing_info_present_flag: (data[4] >> 7) & 0x01,
        vps_num_units_in_tick: (data[5] << 8) | data[6],
        vps_time_scale: (data[7] << 8) | data[8],
    };
}

function parseSPS(data) {
    return {
        sps_seq_parameter_set_id: data[0] & 0x0F,
        sps_max_sub_layers_minus1: (data[0] >> 4) & 0x07,
        sps_temporal_id_nesting_flag: (data[0] >> 7) & 0x01,
        profile_idc: data[1],
        level_idc: data[12],
        chroma_format_idc: data[13] & 0x03,
        bit_depth_luma_minus8: (data[14] >> 3) & 0x07,
        bit_depth_chroma_minus8: data[14] & 0x07,
        log2_max_pic_order_cnt_lsb_minus4: data[15] & 0x0F,
        width: ((data[3] & 0x0F) << 8) | data[4],  
        height: ((data[5] & 0x0F) << 8) | data[6],
        sps_max_dec_pic_buffering_minus1: data[16] & 0x1F,
        sps_max_num_reorder_pics: data[17] & 0x1F,
    };
}

function parsePPS(data) {
    return {
        pps_pic_parameter_set_id: data[0] & 0x3F,
        pps_seq_parameter_set_id: data[1] & 0x3F,
        dependent_slice_segments_enabled_flag: (data[2] >> 7) & 0x01,
        output_flag_present_flag: (data[3] >> 6) & 0x01,
        num_extra_slice_header_bits: data[4] & 0x07,
    };
}

function displayNALInfo() {
    const outputDiv = document.getElementById("nalOutput");
    outputDiv.innerHTML = "";

    nalUnits.forEach((unit, index) => {
        let parsedData = {};
        let title = `NAL Type ${unit.type}`;
        
        if (unit.type === 32) { parsedData = parseVPS(unit.raw); title = "VPS (Video Parameter Set)"; }
        else if (unit.type === 33) { parsedData = parseSPS(unit.raw); title = "SPS (Sequence Parameter Set)"; }
        else if (unit.type === 34) { parsedData = parsePPS(unit.raw); title = "PPS (Picture Parameter Set)"; }

        if (Object.keys(parsedData).length > 0) {
            const section = document.createElement("div");
            section.className = "nal-section";

            const heading = document.createElement("h3");
            heading.textContent = title;
            section.appendChild(heading);

            Object.keys(parsedData).forEach(key => {
                const label = document.createElement("label");
                label.textContent = `${key}: `;

                const input = document.createElement("input");
                input.type = "text";
                input.value = parsedData[key];
                input.dataset.index = index;
                input.dataset.field = key;

                section.appendChild(label);
                section.appendChild(input);
                section.appendChild(document.createElement("br"));
            });

            outputDiv.appendChild(section);
        }
    });

    document.getElementById("downloadBtn").disabled = false;
}

function downloadUpdatedFile() {
    if (!originalData) return;

    const updatedData = new Uint8Array(originalData);
    document.querySelectorAll("#nalOutput input").forEach(input => {
        const index = parseInt(input.dataset.index, 10);
        const field = input.dataset.field;
        const newValue = parseInt(input.value);

        const unit = nalUnits[index];
        if (unit.type === 33) {
            if (field === "profile_idc") updatedData[unit.start + 1] = newValue;
            if (field === "level_idc") updatedData[unit.start + 12] = newValue;
        }
        if (unit.type === 32) {
            if (field === "vps_video_parameter_set_id") updatedData[unit.start] = (updatedData[unit.start] & 0xE0) | newValue;
        }
        if (unit.type === 34) {
            if (field === "pps_pic_parameter_set_id") updatedData[unit.start] = (updatedData[unit.start] & 0xC0) | newValue;
        }
    });

    const blob = new Blob([updatedData], { type: "video/mp4" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified_stream.h265";
    link.click();
}
