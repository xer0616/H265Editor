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
"use strict";

// Global variables to store parsed NAL units
let parsedNALs = [];

// Function to parse the uploaded H.265 bitstream
function parseBitstream(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        parsedNALs = extractNALUnits(data);
        displayParsedData(parsedNALs);
    };
    reader.readAsArrayBuffer(file);
}

// Extract NAL units from the bitstream
function extractNALUnits(data) {
    let nalUnits = [];
    let i = 0;
    while (i < data.length - 4) {
        if (data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x01) {
            let start = i + 3;
            i += 3;
            while (i < data.length - 3 && !(data[i] === 0x00 && data[i + 1] === 0x00 && data[i + 2] === 0x01)) {
                i++;
            }
            let nalUnit = data.slice(start, i);
            let nalType = (nalUnit[0] >> 1) & 0x3F;
            nalUnits.push({ type: nalType, data: nalUnit, parsed: parseNALData(nalType, nalUnit) });
        } else {
            i++;
        }
    }
    return nalUnits;
}

// Parse NAL unit based on type
function parseNALData(nalType, data) {
    switch (nalType) {
        case 32: return parseVPS(data);
        case 33: return parseSPS(data);
        case 34: return parsePPS(data);
        default: return { raw: Array.from(data) };
    }
}

// Function to encode SPS fields back into binary format
function encodeSPS(sps) {
    let data = new Uint8Array(7);
    data[0] = sps.sps_seq_parameter_set_id & 0x1F;
    data[1] = ((sps.sps_max_sub_layers_minus1 & 0x07) << 3);
    data[2] = sps.sps_chroma_format_idc & 0x03;
    data[3] = (sps.sps_pic_width_in_luma_samples >> 8) & 0xFF;
    data[4] = sps.sps_pic_width_in_luma_samples & 0xFF;
    data[5] = (sps.sps_pic_height_in_luma_samples >> 8) & 0xFF;
    data[6] = sps.sps_pic_height_in_luma_samples & 0xFF;
    return data;
}

// Function to encode PPS fields back into binary format
function encodePPS(pps) {
    let data = new Uint8Array(3);
    data[0] = pps.pps_pic_parameter_set_id & 0x3F;
    data[1] = pps.pps_seq_parameter_set_id & 0x1F;
    data[2] = (pps.pps_entropy_coding_mode_flag & 0x01) << 7;
    return data;
}

// Function to rebuild and download updated bitstream
function downloadUpdatedFile() {
    let updatedData = [];
    parsedNALs.forEach(nal => {
        updatedData.push(0x00, 0x00, 0x01);
        if (nal.type === 32) {
            nal.data = encodeVPS(nal.parsed);
        } else if (nal.type === 33) {
            nal.data = encodeSPS(nal.parsed);
        } else if (nal.type === 34) {
            nal.data = encodePPS(nal.parsed);
        }
        updatedData.push(...nal.data);
    });
    let blob = new Blob([new Uint8Array(updatedData)], { type: "application/octet-stream" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "updated_stream.h265";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// File input event listener
document.getElementById("fileInput").addEventListener("change", function (event) {
    parseBitstream(event.target.files[0]);
});

// Add download button event listener
document.getElementById("downloadButton").addEventListener("click", function () {
    downloadUpdatedFile();
});
