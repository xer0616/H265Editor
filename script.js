let vps_struct = {
  "vps_video_parameter_set_id": 0,
  "vps_reserved_three_2bits": 3,
  "vps_max_layers_minus1": 0,
  "vps_max_sub_layers_minus1": 0,
  "vps_temporal_id_nesting_flag": 0,
  "vps_reserved_0xffff_16bits": 65535,
  "vps_sub_layer_ordering_info_present_flag": 0,
  "vps_max_dec_pic_buffering_minus1": [],
  "vps_max_num_reorder_pics": [],
  "vps_max_latency_increase_plus1": [],
  "vps_max_layer_id": 0,
  "vps_num_layer_sets_minus1": 0,
  "layer_id_included_flag": [],
  "vps_timing_info_present_flag": 0,
  "vps_num_units_in_tick": 0,
  "vps_time_scale": 0,
  "vps_poc_proportional_to_timing_flag": 0,
  "vps_num_ticks_poc_diff_one_minus1": 0,
  "vps_num_hrd_parameters": 0,
  "hrd_layer_set_idx": [],
  "cprms_present_flag": [],
  "vps_extension_flag": 0
}
let sps_struct = {
  "sps_video_parameter_set_id": 0,
  "sps_max_sub_layers_minus1": 0,
  "sps_temporal_id_nesting_flag": 0,
  "sps_seq_parameter_set_id": 0,
  "chroma_format_idc": 1,
  "separate_colour_plane_flag": 0,
  "pic_width_in_luma_samples": 1920,
  "pic_height_in_luma_samples": 1080,
  "conformance_window_flag": 0,
  "conf_win_left_offset": 0,
  "conf_win_right_offset": 0,
  "conf_win_top_offset": 0,
  "conf_win_bottom_offset": 0,
  "bit_depth_luma_minus8": 0,
  "bit_depth_chroma_minus8": 0,
  "log2_max_pic_order_cnt_lsb_minus4": 0,
  "sps_max_dec_pic_buffering_minus1": [],
  "sps_max_num_reorder_pics": [],
  "sps_max_latency_increase_plus1": [],
  "log2_min_luma_coding_block_size_minus3": 0,
  "log2_diff_max_min_luma_coding_block_size": 0,
  "log2_min_transform_block_size_minus2": 0,
  "log2_diff_max_min_transform_block_size": 0,
  "max_transform_hierarchy_depth_inter": 0,
  "max_transform_hierarchy_depth_intra": 0,
  "scaling_list_enabled_flag": 0,
  "sps_scaling_list_data_present_flag": 0,
  "sps_amp_enabled_flag": 0,
  "sps_sample_adaptive_offset_enabled_flag": 0,
  "pcm_enabled_flag": 0,
  "pcm_sample_bit_depth_luma_minus1": 0,
  "pcm_sample_bit_depth_chroma_minus1": 0,
  "log2_min_pcm_luma_coding_block_size_minus3": 0,
  "log2_diff_max_min_pcm_luma_coding_block_size": 0,
  "pcm_loop_filter_disabled_flag": 0,
  "num_short_term_ref_pic_sets": 0,
  "long_term_ref_pics_present_flag": 0,
  "sps_temporal_mvp_enabled_flag": 0,
  "strong_intra_smoothing_enabled_flag": 0,
  "vui_parameters_present_flag": 0,
  "sps_extension_flag": 0
}
let pps_struct = {
  "pps_pic_parameter_set_id": 0,
  "pps_seq_parameter_set_id": 0,
  "dependent_slice_segments_enabled_flag": 0,
  "output_flag_present_flag": 0,
  "num_extra_slice_header_bits": 0,
  "sign_data_hiding_enabled_flag": 0,
  "cabac_init_present_flag": 0,
  "num_ref_idx_l0_default_active_minus1": 0,
  "num_ref_idx_l1_default_active_minus1": 0,
  "init_qp_minus26": 0,
  "constrained_intra_pred_flag": 0,
  "transform_skip_enabled_flag": 0,
  "cu_qp_delta_enabled_flag": 0,
  "diff_cu_qp_delta_depth": 0,
  "pps_cb_qp_offset": 0,
  "pps_cr_qp_offset": 0,
  "pps_slice_chroma_qp_offsets_present_flag": 0,
  "weighted_pred_flag": 0,
  "weighted_bipred_flag": 0,
  "transquant_bypass_enabled_flag": 0,
  "tiles_enabled_flag": 0,
  "entropy_coding_sync_enabled_flag": 0,
  "loop_filter_across_tiles_enabled_flag": 0,
  "pps_loop_filter_across_slices_enabled_flag": 0,
  "deblocking_filter_control_present_flag": 0,
  "deblocking_filter_override_enabled_flag": 0,
  "pps_deblocking_filter_disabled_flag": 0,
  "pps_scaling_list_data_present_flag": 0,
  "lists_modification_present_flag": 0,
  "log2_parallel_merge_level_minus2": 0,
  "slice_segment_header_extension_present_flag": 0,
  "pps_extension_flag": 0
}
document.getElementById("upload").addEventListener("change", handleFileUpload);
document.getElementById("download").addEventListener("click", downloadUpdatedFile);

let originalBuffer;
let parsedNALs = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        originalBuffer = new Uint8Array(e.target.result);
        parsedNALs = parseNALUnits(originalBuffer);
        displayNALFields(parsedNALs);
    };
    reader.readAsArrayBuffer(file);
}

function parseNALUnits(buffer) {
    let nalUnits = [];
    let i = 0;
    
    while (i < buffer.length - 4) {
        if (buffer[i] === 0x00 && buffer[i+1] === 0x00 && buffer[i+2] === 0x01) {
            let start = i + 3;
            i += 3;
            while (i < buffer.length - 3 && !(buffer[i] === 0x00 && buffer[i+1] === 0x00 && buffer[i+2] === 0x01)) {
                i++;
            }
            let nalUnit = buffer.slice(start, i);
            let nalType = nalUnit[0] & 0x7E >> 1;
            nalUnits.push({ type: nalType, data: nalUnit, parsed: parseNALData(nalType, nalUnit) });
        } else {
            i++;
        }
    }

    return nalUnits;
}

function parseNALData(type, data) {
    let parsed = {};
    switch (type) {
        case 32: parsed = parseVPS(data); break;
        case 33: parsed = parseSPS(data); break;
        case 34: parsed = parsePPS(data); break;
        default: parsed = { raw: data };
    }
    return parsed;
}

function parseVPS(data) {
    return {
        vps_video_parameter_set_id: (data[0] & 0x0F),
        vps_max_layers_minus1: (data[1] >> 4) & 0x1F,
        vps_max_sub_layers_minus1: data[1] & 0x07,
        vps_temporal_id_nesting_flag: (data[1] >> 7) & 0x01,
        vps_max_layer_id: data[2] & 0x3F,
        vps_num_layer_sets_minus1: data[3],
        vps_extension_flag: data[4] & 0x01
    };
}

function parseSPS(data) {
    return {
        sps_seq_parameter_set_id: data[0] & 0x0F,
        sps_max_sub_layers_minus1: (data[0] >> 4) & 0x07,
        profile_idc: data[1],
        level_idc: data[12],
        chroma_format_idc: data[13] & 0x03,
        bit_depth_luma_minus8: (data[14] >> 3) & 0x07,
        bit_depth_chroma_minus8: data[14] & 0x07,
        log2_max_pic_order_cnt_lsb_minus4: data[15] & 0x0F,
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
