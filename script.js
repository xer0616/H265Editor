        width: ((data[3] & 0x0F) << 8) | data[4],
        height: ((data[5] & 0x0F) << 8) | data[6],
        sps_extension_flag: data[17] & 0x01
    };
}

function parsePPS(data) {
    return {
        pps_pic_parameter_set_id: data[0] & 0x3F,
        pps_seq_parameter_set_id: data[1] & 0x3F,
        dependent_slice_segments_enabled_flag: (data[2] >> 7) & 0x01,
        output_flag_present_flag: (data[3] >> 6) & 0x01,
        num_extra_slice_header_bits: data[4] & 0x07,
        pps_extension_flag: data[5] & 0x01
    };
}

function displayNALFields(nalUnits) {
    const fieldsContainer = document.getElementById("fields");
    fieldsContainer.innerHTML = "";

    nalUnits.forEach((nal, index) => {
        const fieldSet = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.textContent = `NAL Type: ${nal.type}`;
        fieldSet.appendChild(legend);

        Object.entries(nal.parsed).forEach(([key, value]) => {
            const label = document.createElement("label");
            label.textContent = key;
            const input = document.createElement("input");
            input.type = "number";
            input.value = value;
            input.dataset.nalIndex = index;
            input.dataset.field = key;
            input.addEventListener("change", handleFieldUpdate);
            fieldSet.appendChild(label);
            fieldSet.appendChild(input);
            fieldSet.appendChild(document.createElement("br"));
        });

        fieldsContainer.appendChild(fieldSet);
    });
}

function handleFieldUpdate(event) {
    const index = event.target.dataset.nalIndex;
    const field = event.target.dataset.field;
    const value = parseInt(event.target.value, 10);

    if (!isNaN(value)) {
        parsedNALs[index].parsed[field] = value;
    }
}

function updateNALData(nal) {
    switch (nal.type) {
        case 32: updateVPS(nal.data, nal.parsed); break;
        case 33: updateSPS(nal.data, nal.parsed); break;
        case 34: updatePPS(nal.data, nal.parsed); break;
    }
}

function updateVPS(data, parsedData) {
    data[0] = (data[0] & 0xF0) | (parsedData.vps_video_parameter_set_id & 0x0F);
    data[1] = ((parsedData.vps_max_layers_minus1 & 0x1F) << 4) | (parsedData.vps_max_sub_layers_minus1 & 0x07);
    data[1] = (data[1] & 0x7F) | ((parsedData.vps_temporal_id_nesting_flag & 0x01) << 7);
    data[2] = (data[2] & 0xC0) | (parsedData.vps_max_layer_id & 0x3F);
    data[3] = parsedData.vps_num_layer_sets_minus1 & 0xFF;
    data[4] = (data[4] & 0xFE) | (parsedData.vps_extension_flag & 0x01);
}

function updateSPS(data, parsedData) {
    data[0] = (data[0] & 0xF0) | (parsedData.sps_seq_parameter_set_id & 0x0F);
    data[0] = (data[0] & 0x8F) | ((parsedData.sps_max_sub_layers_minus1 & 0x07) << 4);
    data[1] = parsedData.profile_idc;
    data[12] = parsedData.level_idc;
    data[13] = (data[13] & 0xFC) | (parsedData.chroma_format_idc & 0x03);
    data[14] = ((parsedData.bit_depth_luma_minus8 & 0x07) << 3) | (parsedData.bit_depth_chroma_minus8 & 0x07);
    data[15] = (data[15] & 0xF0) | (parsedData.log2_max_pic_order_cnt_lsb_minus4 & 0x0F);
    data[3] = (data[3] & 0xF0) | ((parsedData.width >> 8) & 0x0F);
    data[4] = parsedData.width & 0xFF;
    data[5] = (data[5] & 0xF0) | ((parsedData.height >> 8) & 0x0F);
    data[6] = parsedData.height & 0xFF;
    data[17] = (data[17] & 0xFE) | (parsedData.sps_extension_flag & 0x01);
}

function updatePPS(data, parsedData) {
    data[0] = (data[0] & 0xC0) | (parsedData.pps_pic_parameter_set_id & 0x3F);
    data[1] = (data[1] & 0xC0) | (parsedData.pps_seq_parameter_set_id & 0x3F);
    data[2] = (data[2] & 0x7F) | ((parsedData.dependent_slice_segments_enabled_flag & 0x01) << 7);
    data[3] = (data[3] & 0xBF) | ((parsedData.output_flag_present_flag & 0x01) << 6);
    data[4] = (data[4] & 0xF8) | (parsedData.num_extra_slice_header_bits & 0x07);
    data[5] = (data[5] & 0xFE) | (parsedData.pps_extension_flag & 0x01);
}

function downloadUpdatedFile() {
    parsedNALs.forEach(nal => updateNALData(nal));

    let updatedBuffer = new Uint8Array(originalBuffer.length);
    let offset = 0;

    parsedNALs.forEach(nal => {
        updatedBuffer.set([0x00, 0x00, 0x01], offset);
        offset += 3;
        updatedBuffer.set(nal.data, offset);
        offset += nal.data.length;
    });

    const blob = new Blob([updatedBuffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "updated_stream.h265";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
